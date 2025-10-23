package tests

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Prorickey/ftcmetrics/server"
)

func TestRegisterRoute(t *testing.T) {
	SetupDatabaseForTests()
    router := server.SetupRouter()

	testBodys := []struct{
		Body string
		ExpectedCode int
	}{
		{
			Body: ``,
			ExpectedCode: 400,
		},
		{
			Body: `{"username": "test"}`,
			ExpectedCode: 412,
		},
		{
			Body: `{"username": "test", "email":"trevorbedson", "password":"test"}`,
			ExpectedCode: 412,
		},
		{
			Body: `{"username": "test", "email":"test@gmail.com", "password":"test"}`,
			ExpectedCode: 200,
		},
	}

	for _, testCase := range(testBodys) {
		req, _ := http.NewRequest("POST", "/auth/register", bytes.NewBuffer([]byte(testCase.Body)))
		w := httptest.NewRecorder() 

		router.ServeHTTP(w, req)

		if w.Code != testCase.ExpectedCode {
			t.Errorf("expected status %d, got %d", testCase.ExpectedCode, w.Code)
		}
	}
}