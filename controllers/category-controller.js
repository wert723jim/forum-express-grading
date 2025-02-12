const { Category } = require('../models')

const categoryController = {
  // 查詢所有 categories
  getCategories: (req, res, next) => {
    Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/categories', { categories }))
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    Category.create({
      name
    })
      .then(() => {
        req.flash('success_messages', 'Category is successfully created')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  getCategory: (req, res, next) => {
    Promise.all([
      Category.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([category, categories]) => {
        if (!category) throw new Error("Category isn't extist!")
        res.render('admin/categories', { categories, category })
      })
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.update({
          name
        })
      })
      .then(() => {
        req.flash('success_messages', 'Category is successfully updated')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.destroy()
      })
      .then(() => {
        req.flash('success_messages', 'Category is deleted!')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}

module.exports = categoryController
