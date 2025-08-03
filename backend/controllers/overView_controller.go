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
	"go.mongodb.org/mongo-driver/mongo/options"
)

var overviewCollection *mongo.Collection = config.DBinstance().Database("analytics_dashboard").Collection("overview")

const overviewTimeout = 10 * time.Second

func GetOverviewMetrics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), overviewTimeout)
	defer cancel()

	// Sort by date in descending order (newest first)
	opts := options.Find().SetSort(bson.D{{"date", -1}})
	cursor, err := overviewCollection.Find(ctx, bson.M{}, opts)
	if err != nil {
		log.Println("error while fetching overview metrics")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch overview metrics"})
		return
	}

	var metrics []models.OverviewMetrics
	if err := cursor.All(ctx, &metrics); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding overview metrics"})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

func CreateOverviewMetrics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), overviewTimeout)
	defer cancel()

	var metrics models.OverviewMetrics

	if err := c.ShouldBindJSON(&metrics); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid json data"})
		return
	}

	metrics.ID = primitive.NewObjectID()
	metrics.Date = time.Now()

	result, err := overviewCollection.InsertOne(ctx, metrics)
	if err != nil {
		log.Println("Error inserting overview metrics:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save overview metrics"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Overview metrics created successfully",
		"id":      result.InsertedID,
	})
}

func GetLatestOverviewMetrics(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), overviewTimeout)
	defer cancel()

	var metrics models.OverviewMetrics

	// Find the most recent overview metrics by sorting by date in descending order
	opts := options.FindOne().SetSort(bson.D{{"date", -1}})
	err := overviewCollection.FindOne(ctx, bson.M{}, opts).Decode(&metrics)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "no overview metrics found"})
			return
		}
		log.Println("Error fetching latest overview metrics:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch latest overview metrics"})
		return
	}

	c.JSON(http.StatusOK, metrics)
}
