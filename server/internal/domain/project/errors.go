package project

import "errors"

var (
	ErrProjectNotFound       = errors.New("项目不存在")
	ErrProjectShortURLExists = errors.New("项目短链接已存在")
	ErrProjectTitleRequired  = errors.New("项目标题不能为空")
)
