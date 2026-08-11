package project

import "time"

type Project struct {
	ID          int64
	Title       string
	Summary     *string
	Cover       *string
	Content     string
	Status      string
	ShortURL    string
	AuthorID    int64
	IsPublished bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
	DeletedAt   *time.Time
}
