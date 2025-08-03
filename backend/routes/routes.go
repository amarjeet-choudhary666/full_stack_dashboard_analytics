package routes

import (
	"net/http"

	"github.com/amarjeetdev/analystics-dashboard/controllers"
	"github.com/gin-gonic/gin"
)

func InitRoutes(router *gin.Engine) {
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "API is running",
		})
	})

	// API group
	api := router.Group("/api/v1")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "healthy",
			})
		})

		// Campaign routes
		api.GET("/campaigns", controllers.GetCampaign)
		api.POST("/campaigns", controllers.CreateCampaign)

		// Revenue routes
		api.GET("/revenue", controllers.GetRevenueData)
		api.POST("/revenue", controllers.CreateRevenueDataPoint)

		// Overview routes
		api.GET("/overview", controllers.GetOverviewMetrics)
		api.GET("/overview/latest", controllers.GetLatestOverviewMetrics)
		api.POST("/overview", controllers.CreateOverviewMetrics)
	}
}
