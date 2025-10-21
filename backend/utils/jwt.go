package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const refreshTokenLifespan = time.Hour * 24 * 7
const accessTokenLifespan = time.Minute * 5

type TokenInfo struct {
	UserId      string
	TokenId     string
	IssuedAt    time.Time
	ExpiresAt   time.Time
	TokenString string
}

func CreateRefreshToken(userId string) (TokenInfo, error) {
	return createToken(userId, refreshTokenLifespan, os.Getenv("REFRESH_TOKEN_KEY"))
}

func CreateAccessToken(userId string) (TokenInfo, error) {
	return createToken(userId, accessTokenLifespan, os.Getenv("ACCESS_TOKEN_KEY"))
}

func ValidateRefreshToken(tokenString string) (TokenInfo, error) {
	return validateToken(tokenString, os.Getenv("REFRESH_TOKEN_KEY"))
}

func ValidateAccessToken(tokenString string) (TokenInfo, error) {
	return validateToken(tokenString, os.Getenv("ACCESS_TOKEN_KEY"))
}

func createToken(userId string, lifespan time.Duration, signingKey string) (TokenInfo, error) {
	tokenId := uuid.New()
	issuedAt := time.Now()
	expiresAt := time.Now().Add(lifespan)

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId":  userId,
		"tokenId": tokenId.String(),
		"iat":     issuedAt.UnixMilli(),
		"exp":     expiresAt.UnixMilli(),
	})

	tokenString, err := token.SignedString([]byte(signingKey))
	if err != nil {
		return TokenInfo{}, fmt.Errorf("signing token: %v", err)
	}

	return TokenInfo{
		UserId:      userId,
		TokenId:     tokenId.String(),
		IssuedAt:    issuedAt,
		ExpiresAt:   expiresAt,
		TokenString: tokenString,
	}, nil
}

func validateToken(tokenString string, signingKey string) (TokenInfo, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		return []byte(signingKey), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil {
		return TokenInfo{}, fmt.Errorf("parsing token: %v", err)
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		return TokenInfo{
			UserId:      claims["userId"].(string),
			TokenId:     claims["tokenId"].(string),
			IssuedAt:    time.UnixMilli(int64(claims["iat"].(float64))),
			ExpiresAt:   time.UnixMilli(int64(claims["exp"].(float64))),
			TokenString: tokenString,
		}, nil
	} else {
		return TokenInfo{}, fmt.Errorf("extracting claims: %v", err)
	}
}
