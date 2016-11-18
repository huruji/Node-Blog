"use strict";

const express = require('express');
const crypto = require('crypto');
const user = require('./../models/user');
const Post = require('./../models/post');
const Comment = require('./../models/comment');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
	console.log('session.user:'+req.session.user);
	Post.getAll(null, function(err, posts) {
		console.log(posts)
		if(err) {
			posts = [];
		}
		res.render('index', { 
  			title: '主页',
  			posts:posts,
  			user: req.session.user, 
  			success: req.flash('error').toString(),
  			error: req.flash('error').toString()
		});
  	});
});

router.get('/reg', checkNotLogin);
router.post('/reg', checkNotLogin);
router.route('/reg').get( (req, res, next) => {
	res.render('reg',{ 
		title: '注册',
		user: req.session.user, 
  	    success: req.flash('error').toString(),
  	    error: req.flash('error').toString()
	});
}).post( (req, res, next) => {
	let name = req.body.name;
	let email = req.body.email;
	let password = req.body.password;
	let passwordRe= req.body['password-repeat'];
	if(passwordRe != password) {
		req.flash('err', '两次输入的密码不一致');
		return res.redirect('/reg');
	}

	let md5 = crypto.createHash('md5');
	password = md5.update(req.body.password).digest('hex');
	let newUser = new user({
		name: name,
		password: password,
		email: email
	});
	user.get(newUser.name, function(err, user) {
		if(user) {
			req.flash('error', '用户已经存在！');
			return res.redirect('/reg');
		}
		newUser.save(function (err, user0) {
			if (err) {
				req.flash('error', err);
			}
			req.session.user = name;
			console.log("req.session.user:" + req.session.user)
			console.log("user:" + name)
			req.flash('success','注册成功！');
			res.redirect('/');
		});
	});
});

router.get('/login',checkNotLogin);
router.get('/login',checkNotLogin);
router.route('/login').get( (req, res, next) => {
	res.render('login',{
		title: '登录',
		user: req.session.user, 
  		success: req.flash('error').toString(),
  		error: req.flash('error').toString()
	});
}).post( (req, res, next) => {
	let md5 = crypto.createHash('md5');
	let password = md5.update(req.body.password).digest('hex');
	user.get(req.body.name, function (err, user) {
		if(!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}

		if(user.password != password) {
			req.flash('error', '密码错误');
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success', '登陆成功');
		res.redirect('/');
	});
});

router.get('/post',checkLogin);
router.post('/post',checkLogin);
router.route('/post').get( (req, res, next) => {
	res.render('post', {
		title: '发表',
		user: req.session.user, 
  		success: req.flash('error').toString(),
  		error: req.flash('error').toString()
	});
}).post( (req, res, next) => {
	let currentUser = req.session.user;
	let post = new Post(currentUser.name, req.body.title, req.body.post);
	post.save(function (err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功!');
		res.redirect('/');
	})
});

router.get('/logout', (req, res, next) => {
	req.session.user = null;
	req.flash('success', '登出成功！');
	res.redirect('/');
})


router.route('/u/:name').get(function(req, res, next) {
	user.get(req.params.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在！');
			return res.redirect('/');
		}
		Post.getAll(user.name, function(err, posts) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
});

router.get('/u/:name/:day/:title', function(req, res, next) {
	Post.getOne(req.params.name, req.params.day, req.params.title, function(err, post) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('article', {
			title: req.params.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		})
	})
})
router.post('/u/:name/:day/:title', (req, res, next) => {
	let date = new Date();
	let time = [date.getFullYear() + '-',
		        (date.getMonth() + 1) + '-',
		        date.getDate() + ' ',
		        date.getHours() + ':',
		        (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())].join('')
 	let curComment = {
 		name: req.body.name,
 		eamil: req.body.email,
 		website: req.body.website,
 		time: time,
 		content: req.body.content
 	};
 	let comment = new Comment(req.params.name, req.params.day, req.params.title, curComment);
 	comment.save(function(err) {
 		if (err) {
 			req.flash('error', err);
 			return res.redirect('back');
 		}
 		req.flash('success', '留言成功');
 		res.redirect('back');
 	})
})


router.get('/edit/:name/:day/:title', checkLogin);
router.get('/edit/:name/:day/:title', (req, res, next) => {
	let currentUser = req.session.user;
	Post.edit(currentUser.name, req.params.day, req.params.title, (err, post) => {
		if(err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		res.render('edit', {
			title: '编辑',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		})
	})
})
router.post('/edit/:name/:day/:title', checkLogin);
router.post('/edit/:name/:day/:title', (req, res, next) => {
	let currentUser = req.session.user;
	Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function(err) {
		let url='/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title;
		console.log("url:"+url);
		if(err) {
			req.flash('error', err);
			return res.redirect(url);
		}
		req.flash('success', '修改成功');
		res.redirect(url);
	})
})

router.get('/remove/:name/:day/:title', checkLogin);
router.get('/remove/:name/:day/:title', (req, res) => {
	let currentUser = req.session.user;
	post.remove(currentUser.name, req.params.day, req.params.title, function(err) {
		if(err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功');
		req.redirect('/');
	}) 
})

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登录');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登录');
		res.redirect('back');
	}
	next();
}



module.exports = router;
