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

var revenueCollection *mongo.Collection = config.DBinstance().Database("analytics_dashboard").Collection("revenue")

const revenueTimeout = 10 * time.Second

func CreateRevenueDataPoint(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), revenueTimeout)
	defer cancel()

	var revenue models.RevenueDataPoint

	if err := c.ShouldBindJSON(&revenue); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json"})
		return
	}

	revenue.ID = primitive.NewObjectID()
	revenue.Date = time.Now()

	result, err := revenueCollection.InsertOne(ctx, revenue)
	if err != nil {
		log.Println("Error inserting revenue data:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create revenue data"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Revenue data created successfully",
		"id":      result.InsertedID,
	})
}

func GetRevenueData(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), revenueTimeout)
	defer cancel()

	cursor, err := revenueCollection.Find(ctx, bson.M{})
	if err != nil {
		log.Println("error while fetching revenue data")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch revenue data"})
		return
	}

	var revenueData []models.RevenueDataPoint
	if err := cursor.All(ctx, &revenueData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding revenue data"})
		return
	}

	c.JSON(http.StatusOK, revenueData)
}
