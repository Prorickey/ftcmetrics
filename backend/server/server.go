package server

import (
	"github.com/Prorickey/ftcmetrics/routes"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	routes.RegisterAuthRoutes(router)

	return router
}