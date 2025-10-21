package database

import (
	"fmt"
	"time"

	"github.com/Prorickey/ftcmetrics/utils"
)

func StoreRefreshToken(tokenInfo utils.TokenInfo) error {
	_, err := glob_db.Exec(`
		INSERT INTO refresh_tokens (id, user_id, issued_at, expires_at)
		VALUES ($1, $2, $3, $4)
	`, tokenInfo.TokenId, tokenInfo.UserId, tokenInfo.IssuedAt, tokenInfo.ExpiresAt)

	if err != nil {
		return fmt.Errorf("storing refresh token: %v", err)
	}

	return nil
}

func StoreAccessToken(tokenInfo utils.TokenInfo) error {
	_, err := glob_db.Exec(`
		INSERT INTO access_tokens (id, user_id, issued_at, expires_at)
		VALUES ($1, $2, $3, $4)
	`, tokenInfo.TokenId, tokenInfo.UserId, tokenInfo.IssuedAt, tokenInfo.ExpiresAt)

	if err != nil {
		return fmt.Errorf("storing access token: %v", err)
	}

	return nil
}

func ValidateRefreshToken(tokenId string, userId string) (bool, error) {
	var isValid bool
	var expiresAt time.Time

	err := glob_db.QueryRow(`
		SELECT is_valid, expires_at 
		FROM refresh_tokens 
		WHERE id = $1 AND user_id = $2
	`, tokenId, userId).Scan(&isValid, &expiresAt)

	if err != nil {
		return false, fmt.Errorf("querying refresh token: %v", err)
	}

	if !isValid {
		return false, fmt.Errorf("token has been revoked")
	}

	if time.Now().After(expiresAt) {
		return false, fmt.Errorf("token has expired")
	}

	return true, nil
}

func ValidateAccessToken(tokenId string, userId string) (bool, error) {
	var isValid bool
	var expiresAt time.Time

	err := glob_db.QueryRow(`
		SELECT is_valid, expires_at 
		FROM access_tokens 
		WHERE id = $1 AND user_id = $2
	`, tokenId, userId).Scan(&isValid, &expiresAt)

	if err != nil {
		return false, fmt.Errorf("querying access token: %v", err)
	}

	if !isValid {
		return false, fmt.Errorf("token has been revoked")
	}

	if time.Now().After(expiresAt) {
		return false, fmt.Errorf("token has expired")
	}

	return true, nil
}

func InvalidateRefreshToken(tokenId string) error {
	_, err := glob_db.Exec(`
		UPDATE refresh_tokens 
		SET is_valid = FALSE 
		WHERE id = $1
	`, tokenId)

	if err != nil {
		return fmt.Errorf("invalidating refresh token: %v", err)
	}

	return nil
}

func InvalidateAccessToken(tokenId string) error {
	_, err := glob_db.Exec(`
		UPDATE access_tokens 
		SET is_valid = FALSE 
		WHERE id = $1
	`, tokenId)

	if err != nil {
		return fmt.Errorf("invalidating access token: %v", err)
	}

	return nil
}

func InvalidateAllUserTokens(userId string) error {
	tx, err := glob_db.Beginx()
	if err != nil {
		return fmt.Errorf("beginning transaction: %v", err)
	}

	defer tx.Rollback()

	_, err = tx.Exec(`
		UPDATE refresh_tokens 
		SET is_valid = FALSE 
		WHERE user_id = $1 AND is_valid = TRUE
	`, userId)

	if err != nil {
		return fmt.Errorf("invalidating refresh tokens: %v", err)
	}

	_, err = tx.Exec(`
		UPDATE access_tokens 
		SET is_valid = FALSE 
		WHERE user_id = $1 AND is_valid = TRUE
	`, userId)

	if err != nil {
		return fmt.Errorf("invalidating access tokens: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("committing transaction: %v", err)
	}

	return nil
}
