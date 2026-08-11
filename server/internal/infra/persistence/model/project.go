package model

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID          int64          `gorm:"column:id;primaryKey"`
	Title       string         `gorm:"column:title;size:255;not null"`
	Summary     *string        `gorm:"column:summary;type:text"`
	Cover       *string        `gorm:"column:cover;size:255"`
	Content     string         `gorm:"column:content;type:text;not null;default:''"`
	Status      string         `gorm:"column:status;size:32;not null;default:'进行中'"`
	ShortURL    string         `gorm:"column:short_url;size:255;not null"`
	AuthorID    int64          `gorm:"column:author_id;not null"`
	IsPublished bool           `gorm:"column:is_published;default:false"`
	CreatedAt   time.Time      `gorm:"column:created_at;autoCreateTime"`
	UpdatedAt   time.Time      `gorm:"column:updated_at;autoUpdateTime"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;index"`
}

func (Project) TableName() string { return "project" }
