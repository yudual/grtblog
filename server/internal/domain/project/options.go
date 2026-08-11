package project

// ProjectListOptions 公开列表查询参数。
type ProjectListOptions struct {
	Page     int
	PageSize int
	Search   *string
}

// ProjectListOptionsInternal 管理后台列表查询参数。
type ProjectListOptionsInternal struct {
	Page      int
	PageSize  int
	Published *bool
	Search    *string
}
