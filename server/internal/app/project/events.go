package project

import "time"

type ProjectCreated struct {
	ID        int64
	AuthorID  int64
	Title     string
	ShortURL  string
	Published bool
	At        time.Time
}

func (e ProjectCreated) Name() string          { return "project.created" }
func (e ProjectCreated) OccurredAt() time.Time { return e.At }

type ProjectUpdated struct {
	ID        int64
	AuthorID  int64
	Title     string
	ShortURL  string
	Published bool
	At        time.Time
}

func (e ProjectUpdated) Name() string          { return "project.updated" }
func (e ProjectUpdated) OccurredAt() time.Time { return e.At }

type ProjectPublished struct {
	ID       int64
	AuthorID int64
	Title    string
	ShortURL string
	At       time.Time
}

func (e ProjectPublished) Name() string          { return "project.published" }
func (e ProjectPublished) OccurredAt() time.Time { return e.At }

type ProjectUnpublished struct {
	ID       int64
	AuthorID int64
	Title    string
	ShortURL string
	At       time.Time
}

func (e ProjectUnpublished) Name() string          { return "project.unpublished" }
func (e ProjectUnpublished) OccurredAt() time.Time { return e.At }

type ProjectDeleted struct {
	ID       int64
	AuthorID int64
	Title    string
	ShortURL string
	At       time.Time
}

func (e ProjectDeleted) Name() string          { return "project.deleted" }
func (e ProjectDeleted) OccurredAt() time.Time { return e.At }
