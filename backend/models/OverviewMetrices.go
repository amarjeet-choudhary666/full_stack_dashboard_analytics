package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OverviewMetrics struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Revenue     float64            `bson:"revenue" json:"revenue"`
	Users       int                `bson:"users" json:"users"`
	Conversions int                `bson:"conversions" json:"conversions"`
	Growth      float64            `bson:"growth" json:"growth"`
	Date        time.Time          `bson:"date" json:"date"`
}
