const { Restaurant, User, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helper')
const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      // 把 sequelize 包裝過的一大包物件轉換成 JS 原生物件
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  createRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body

    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req

    imgurFileHandler(file)
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      }))
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully created')
        res.redirect('admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exit")

        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    // 查詢 Restaurants table、 查詢 Categories table 沒有先後順序，不需要互相等待
    Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant didn't exit")

        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body

    if (!name) throw new Error('Restaurant name is required!')
    // 不需要設置 raw 因為後續還要進行 sequelize 的處裡
    const { file } = req
    // 非同步處理，要首先處理這兩個 promise 且這兩個 promise沒有優先順序，因此用 promise.all 來等這兩個 promise 處理完畢後才接續下面的動作。
    Promise.all([
      imgurFileHandler(file),
      Restaurant.findByPk(req.params.id)
    ])
      .then(([filePath, restaurant]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          categoryId
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was updated successfully!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.destroy()
      }).then(() => {
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true
    })
      .then(users => res.render('admin/users', { users }))
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    const id = req.params.id
    return User.findByPk(id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        const { isAdmin } = user
        if (user.name === 'admin') throw new Error('禁止變更 root 權限')
        return user.update({
          isAdmin: !isAdmin
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => {
        req.flash('error_messages', err.message)
        res.redirect('back')
      })
  }
}

module.exports = adminController
