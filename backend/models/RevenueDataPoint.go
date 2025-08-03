package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RevenueDataPoint struct {
	ID      primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Date    time.Time          `bson:"date" json:"date"`
	Revenue float64            `bson:"revenue" json:"revenue"`
	Source  string             `bson:"source" json:"source"` // e.g., "subscription", "one-time", "ads"
	Region  string             `bson:"region" json:"region"` // e.g., "US", "EU", "APAC"
}

type RevenueAnalytics struct {
	TotalRevenue    float64                    `json:"totalRevenue"`
	MonthlyRevenue  float64                    `json:"monthlyRevenue"`
	WeeklyRevenue   float64                    `json:"weeklyRevenue"`
	DailyRevenue    float64                    `json:"dailyRevenue"`
	RevenueGrowth   float64                    `json:"revenueGrowth"`
	RevenueBySource map[string]float64         `json:"revenueBySource"`
	RevenueByRegion map[string]float64         `json:"revenueByRegion"`
	MonthlyTrend    []MonthlyRevenueData       `json:"monthlyTrend"`
	TopPerformers   []RevenueSourcePerformance `json:"topPerformers"`
}

type MonthlyRevenueData struct {
	Month   string  `json:"month"`
	Revenue float64 `json:"revenue"`
	Growth  float64 `json:"growth"`
}

type RevenueSourcePerformance struct {
	Source  string  `json:"source"`
	Revenue float64 `json:"revenue"`
	Percent float64 `json:"percent"`
}
