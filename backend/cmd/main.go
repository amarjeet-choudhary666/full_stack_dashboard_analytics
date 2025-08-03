package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/amarjeetdev/analystics-dashboard/config"
	"github.com/amarjeetdev/analystics-dashboard/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	client := config.DBinstance()
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			log.Fatal("Error disconnecting from database:", err)
		}
	}()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Starting server on port %s\n", port)

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Add CORS middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	routes.InitRoutes(router)

	log.Printf("Server running on http://localhost:%s", port)
	router.Run(":" + port)
}
