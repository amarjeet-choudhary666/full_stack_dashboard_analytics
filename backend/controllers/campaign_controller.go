package controllers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/amarjeetdev/analystics-dashboard/config"
	"github.com/amarjeetdev/analystics-dashboard/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var campaignCollection *mongo.Collection = config.DBinstance().Database("analytics_dashboard").Collection("campaign")

const timeOut = 10 * time.Second

func GetCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), timeOut)
	defer cancel()

	cursor, err := campaignCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("error while fetching the campaign")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch campaign"})
		return
	}

	var campaign []models.CampaignConversion
	if err := cursor.All(ctx, &campaign); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding campaign"})
		return
	}

	c.JSON(http.StatusOK, campaign)
}

func CreateCampaign(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), timeOut)
	defer cancel()

	var campaign models.CampaignConversion

	if err := c.BindJSON(&campaign); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid json data"})
		return
	}

	campaign.ID = primitive.NewObjectID()
	campaign.Date = time.Now()

	result, err := campaignCollection.InsertOne(ctx, campaign)
	if err != nil {
		log.Println("Error inserting campaign:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create campaign"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Campaign created successfully",
		"id":      result.InsertedID,
	})
}
