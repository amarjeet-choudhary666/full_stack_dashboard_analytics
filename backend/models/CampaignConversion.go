package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CampaignConversion struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Campaign    string             `bson:"campaign" json:"campaign"`
	Conversions int                `bson:"conversions" json:"conversions"`
	Date        time.Time          `bson:"date" json:"date"`
}
