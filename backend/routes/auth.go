package routes

import (
	"log"
	"strings"

	"github.com/Prorickey/ftcmetrics/database"
	"github.com/Prorickey/ftcmetrics/utils"
	"github.com/alexedwards/argon2id"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator"
)

func RegisterAuthRoutes(engine *gin.Engine) {
	auth := engine.Group("/auth")
	{
		auth.POST("/register", registerUser)
		auth.POST("/login", loginUser)
		auth.POST("/refresh", refreshToken)
		auth.POST("/logout", RequireAuth(), logout)
	}
}

type RegisterUserBody struct {
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type tokenResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         interface{} `json:"user,omitempty"`
}

type loginUserBody struct {
	UsernameOrEmail string `json:"username_or_email"`
	Password        string `json:"password"`
}

// POST /auth/register
func registerUser(ctx *gin.Context) {
	var body RegisterUserBody
	err := ctx.ShouldBindBodyWithJSON(&body)
	if err != nil {
		log.Printf("error unmarshaling json: %v", err)
		ctx.JSON(400, gin.H{"error": "malformed body"})
		return
	}

	v := validator.New()
	if err := v.Struct(body); err != nil {
		log.Printf("error validating body: %v", err)
		ctx.JSON(412, gin.H{"error": "body must have a name, email, and password"})
		return
	}

	digest, err := argon2id.CreateHash(body.Password, argon2id.DefaultParams)
	if err != nil {
		log.Printf("error hashing password: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	user, err := database.CreateUser(body.Username, body.Email, digest)
	if err != nil {
		if user.Username == "exists" {
			ctx.JSON(409, gin.H{"error": "username or email already taken"})
			return
		}

		log.Printf("creating user: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// Create refresh and access token for user
	refreshToken, err := utils.CreateRefreshToken(user.ID)
	if err != nil {
		log.Printf("error creating refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	accessToken, err := utils.CreateAccessToken(user.ID)
	if err != nil {
		log.Printf("error creating access token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// Store tokens in database
	if err := database.StoreRefreshToken(refreshToken); err != nil {
		log.Printf("error storing refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if err := database.StoreAccessToken(accessToken); err != nil {
		log.Printf("error storing access token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	ctx.JSON(200, tokenResponse{
		AccessToken:  accessToken.TokenString,
		RefreshToken: refreshToken.TokenString,
		User: gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"created_at": user.CreatedAt,
		},
	})
}

// POST /auth/login
func loginUser(ctx *gin.Context) {
	var body loginUserBody
	err := ctx.ShouldBindBodyWithJSON(&body)
	if err != nil {
		log.Printf("error unmarshaling json: %v", err)
		ctx.JSON(400, gin.H{"error": "malformed body"})
		return
	}

	// Get user by username or email
	user, err := database.GetUserByUsernameOrEmail(body.UsernameOrEmail)
	if err != nil {
		log.Printf("error getting user: %v", err)
		ctx.JSON(401, gin.H{"error": "invalid credentials"})
		return
	}

	// Verify password
	match, err := argon2id.ComparePasswordAndHash(body.Password, user.Digest)
	if err != nil {
		log.Printf("error comparing password: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if !match {
		ctx.JSON(401, gin.H{"error": "invalid credentials"})
		return
	}

	// Create refresh and access token for user
	refreshToken, err := utils.CreateRefreshToken(user.ID)
	if err != nil {
		log.Printf("error creating refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	accessToken, err := utils.CreateAccessToken(user.ID)
	if err != nil {
		log.Printf("error creating access token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// Store tokens in database
	if err := database.StoreRefreshToken(refreshToken); err != nil {
		log.Printf("error storing refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if err := database.StoreAccessToken(accessToken); err != nil {
		log.Printf("error storing access token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	ctx.JSON(200, tokenResponse{
		AccessToken:  accessToken.TokenString,
		RefreshToken: refreshToken.TokenString,
		User: gin.H{
			"id":         user.ID,
			"username":   user.Username,
			"email":      user.Email,
			"created_at": user.CreatedAt,
		},
	})
}

type refreshTokenBody struct {
	RefreshToken string `json:"refresh_token"`
}

// POST /auth/refresh
func refreshToken(ctx *gin.Context) {
	var body refreshTokenBody
	err := ctx.ShouldBindBodyWithJSON(&body)
	if err != nil {
		log.Printf("error unmarshaling json: %v", err)
		ctx.JSON(400, gin.H{"error": "malformed body"})
		return
	}

	// Validate the refresh token JWT
	tokenInfo, err := utils.ValidateRefreshToken(body.RefreshToken)
	if err != nil {
		log.Printf("error validating refresh token: %v", err)
		ctx.JSON(401, gin.H{"error": "invalid refresh token"})
		return
	}

	// Validate token exists and is valid in database
	valid, err := database.ValidateRefreshToken(tokenInfo.TokenId, tokenInfo.UserId)
	if err != nil || !valid {
		log.Printf("error validating refresh token in db: %v", err)
		ctx.JSON(401, gin.H{"error": "invalid or expired refresh token"})
		return
	}

	// Invalidate old refresh token
	if err := database.InvalidateRefreshToken(tokenInfo.TokenId); err != nil {
		log.Printf("error invalidating old refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// Create new refresh and access tokens
	newRefreshToken, err := utils.CreateRefreshToken(tokenInfo.UserId)
	if err != nil {
		log.Printf("error creating new refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	newAccessToken, err := utils.CreateAccessToken(tokenInfo.UserId)
	if err != nil {
		log.Printf("error creating new access token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	// Store new tokens in database
	if err := database.StoreRefreshToken(newRefreshToken); err != nil {
		log.Printf("error storing new refresh token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	if err := database.StoreAccessToken(newAccessToken); err != nil {
		log.Printf("error storing new access token: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	ctx.JSON(200, tokenResponse{
		AccessToken:  newAccessToken.TokenString,
		RefreshToken: newRefreshToken.TokenString,
	})
}

// POST /auth/logout
func logout(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")

	// Invalidate all tokens for the user
	if err := database.InvalidateAllUserTokens(userId.(string)); err != nil {
		log.Printf("error invalidating user tokens: %v", err)
		ctx.JSON(500, gin.H{"error": "internal server error"})
		return
	}

	ctx.JSON(200, gin.H{"message": "logged out successfully"})
}

// RequireAuth middleware validates access token
func RequireAuth() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")
		if authHeader == "" {
			ctx.AbortWithStatusJSON(401, gin.H{"error": "authorization header required"})
			return
		}

		// Extract Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.AbortWithStatusJSON(401, gin.H{"error": "invalid authorization header format"})
			return
		}

		tokenString := parts[1]

		// Validate the access token JWT
		tokenInfo, err := utils.ValidateAccessToken(tokenString)
		if err != nil {
			log.Printf("error validating access token: %v", err)
			ctx.AbortWithStatusJSON(401, gin.H{"error": "invalid access token"})
			return
		}

		// Validate token exists and is valid in database
		valid, err := database.ValidateAccessToken(tokenInfo.TokenId, tokenInfo.UserId)
		if err != nil || !valid {
			log.Printf("error validating access token in db: %v", err)
			ctx.AbortWithStatusJSON(401, gin.H{"error": "invalid or expired access token"})
			return
		}

		// Store user ID in context for downstream handlers
		ctx.Set("userId", tokenInfo.UserId)
		ctx.Set("tokenId", tokenInfo.TokenId)

		ctx.Next()
	}
}
