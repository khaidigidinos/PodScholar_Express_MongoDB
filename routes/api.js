var express = require('express');
var router = express.Router();
var conn = require('./../mongodb.js')
const { ObjectID } = require('mongodb')
var createError = require('http-errors');
const secret = '09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611'
const jwt = require('jsonwebtoken');

router.get('/', async function(req, res, next) {
	let db = await getDb()

	let listIds = await db.collection('podcaststimeline').findOne()
	let ids = listIds.list.slice(0, 10)
	ids = ids.map((e) => new ObjectID(e))

	await db.collection('podcasts').find({ _id: {$in: ids}}).toArray(function(err, result) {
		if(err) {
			console.log(err)
		}
		else {
			res.status(200).json({ ids: ids, list:result })
		}
	})

})

router.get('/search/keyword/:keyword', async function(req, res, next) {
	let db = await getDb()
	let kw = req.params.keyword
	await db.collection('podcasts').find({ $or: [{ title: { $regex: kw, $options : 'i' }}, { doi: { $regex: kw, $options : 'i' } }, { "author_names" : { $regex: kw, $options : 'i' } }]})
	.limit(10)
	.toArray(function(err, result) {
		if(err) console.log(err)
		else {
			res.status(200).json(result)
		}
	})
})

router.get('/search/date/:date', async function(req, res, next) {
	let db = await getDb()
	let date = req.params.date
	date = date.replace('_', '/').replace('_', '/')

	await db.collection('podcasts').find({ date: date }).limit(10).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/categories/:name/search/date/:date', async function(req, res, next) {
	let db = await getDb()

	let discipline = await db.collection('scientific-discipline').findOne({ name: req.params['name'] })

	if(!discipline) {
		next(createError(404))
		return
	}

	let ids = discipline.list.map((e) => new ObjectID(e))
	let date = req.params.date
	date = date.replace('_', '/')
	date = date.replace('_', '/')
	await db.collection('podcasts').find({ _id: { $in: ids }, date: date }).limit(10).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/categories/:name/search/keyword/:keyword', async function(req, res, next) {
	let db = await getDb()

	let discipline = await db.collection('scientific-discipline').findOne({ name: req.params['name'] })

	if(!discipline) {
		next(createError(404))
		return
	}

	let ids = discipline.list.map((e) => new ObjectID(e))

	await db.collection('podcasts').find({ _id: { $in: ids }, tags: req.params.keyword }).limit(10).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/categories/:name', async function(req, res, next) {
	let db = await getDb()

	let discipline = await db.collection('scientific-discipline').findOne({ name: req.params['name'] })

	if(!discipline) {
		next(createError(404))
		return
	}

	let ids = discipline.list.slice(0, 10).map((e) => new ObjectID(e))

	await db.collection('podcasts').find({ _id : { $in: ids }}).limit(10).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/categories', async function(req, res, next) {
	let db = await getDb()

	await db.collection('scientific-discipline').find({}).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/keywords/:name/search/date/:date', async function(req, res, next) {
	let db = await getDb()

	let discipline = await db.collection('tag').findOne({ name: req.params['name'] })

	if(!discipline) {
		next(createError(404))
		return
	}

	let ids = discipline.list.map((e) => new ObjectID(e))
	let date = req.params.date
	date = date.replace('_', '/')
	date = date.replace('_', '/')
	await db.collection('podcasts').find({ _id: { $in: ids }, date: date }).limit(10).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/keywords/:name', async function(req, res, next) {
	let db = await getDb()

	let discipline = await db.collection('tag').findOne({ name: req.params['name'] })

	if(!discipline) {
		next(createError(404))
		return
	}

	let ids = discipline.list.slice(0, 10).map((e) => new ObjectID(e))

	await db.collection('podcasts').find({ _id : { $in: ids }}).limit(10).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.get('/keywords', async function(req, res, next) {
	let db = await getDb()

	await db.collection('tag').find({}).toArray(function(err, result) {
		if(err) {
			console.log(err)
		} else {
			res.status(200).json(result)
		}
	})
})

router.post('/auth/signup', async function(req, res, next) {
	let db = await getDb()

	let data = JSON.parse(Object.keys(req.body)[0])

	let user = await db.collection('user').findOne({ email : data.email })

	if(user) {
		res.status(400).json({})
		return
	}

	try {
		await db.collection('user').insertOne(data)
		res.status(200).json({})
	} catch (e) {
		console.log(e)
	}

})

router.post('/auth/signin', async function(req, res, next) {
	let db = await getDb()

	let user = await db.collection('user').findOne({ email: req.body.email, password: req.body.password })
	if(!user) {
		res.status(404)
		return
	}

	let userInfo = {
		email: user.email,
		id: user._id,
		is_verified_author: user.is_verified_author,
		firstName: user.firstName,
		lastName: user.lastName,
	}

	const token = jwt.sign(userInfo, secret, { expiresIn: '1800000s' })

	res.status(200).json({ token: token })
})

router.post('/authors', async function(req, res, next) {
	let db = await getDb()

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404)
		return
	}

	let data = JSON.parse(Object.keys(req.body)[0])

	user.firstName = data.firstName
  user.lastName = data.lastName
  user.tags = data.tags
  user.scientific_disciplines = data.scientific_disciplines
  user.current_affiliation = data.current_affiliation
  user.academic_email = data.academic_email
  user.proof_url = data.proof_url
  user.bio = data.bio
  user.research_profile = data.research_profile

  user.is_verified_author = true

  await db.collection('user').replaceOne({ _id: new ObjectID(user._id) }, user)
  
  let userInfo = {
		email: user.email,
		id: user._id,
		is_verified_author: user.is_verified_author,
		firstName: user.firstName,
		lastName: user.lastName,
	}

	const token = jwt.sign(userInfo, secret, { expiresIn: '1800000s' })

	res.status(200).json({ token: token })
})

router.get('/account', async function(req, res, next) {
	let db = await getDb()
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404)
		return
	}

	res.status(200).json(user)

})

router.patch('/account', async function(req, res, next) {
	let db = await getDb()

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404)
		return
	}

	let data = JSON.parse(Object.keys(req.body)[0])
	let keys = Object.keys(data)

	if(keys.indexOf('email') > 0) {
		let email = await db.collection('user').findOne({ email: data.email })

		if(email) {
			res.status(400)
			return
		}
	}

	for(let i = 0; i < keys.length; i++) {
		user[keys[i]] = data[keys[i]]
	}

	await db.collection('user').replaceOne({ _id: new ObjectID(user._id) }, user)
  
  let userInfo = {
		email: user.email,
		id: user._id,
		is_verified_author: user.is_verified_author,
		firstName: user.firstName,
		lastName: user.lastName,
	}

	const token = jwt.sign(userInfo, secret, { expiresIn: '1800000s' })

	res.status(200).json({ token: token })
})

router.post('/podcasts', async function(req, res, next) {
	let db = await getDb()
	let data = JSON.parse(Object.keys(req.body)[0])

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404).json({})
	}

	let timeline = await db.collection('podcaststimeline').findOne({})

	try {
		let pc = await db.collection('podcasts').insertOne(data)
		timeline.list.unshift(pc.insertedId)

		let id = pc.insertedId

		await db.collection('podcaststimeline').replaceOne({ _id: new ObjectID(timeline._id) }, timeline)

		for(let i = 0; i < data.scientific_disciplines.length; i++) {
			let sd = data.scientific_disciplines[i]
			let curr = await db.collection('scientific-discipline').findOne({ name: sd })

			if(curr) {
				curr.list.unshift(id)
				curr.count += 1
				await db.collection('scientific-discipline').replaceOne({ _id: new ObjectID(curr._id) }, curr)
			} else {
				await db.collection('scientific-discipline').insertOne({
					name: sd,
					list: [id],
					count: 1
				})
			}
		}

		for(let i = 0; i < data.scientific_disciplines.length; i++) {
			let tag = data.tags[i]
			let curr = await db.collection('tag').findOne({ name: tag })

			if(curr) {
				curr.list.unshift(id)
				curr.count += 1
				await db.collection('tag').replaceOne({ _id: new ObjectID(curr._id) }, curr)
			} else {
				await db.collection('tag').insertOne({
					name: tag,
					list: [id],
					count: 1
				})
			}
		}

		user.uploads.unshift(id)

		await db.collection('user').replaceOne({ _id: new ObjectID(user._id)}, user)

		res.status(200).json({})
	} catch (e) {
		console.log(e)
	}
})

router.get('/podcasts/:id', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let pc = await db.collection('podcasts').findOne({ _id: new ObjectID(req.params.id) })
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!pc) {
		res.status(404).json({})
		return
	}

	if(!user) {
		res.status(401).json({})
		return
	}

	let authors = []

	for(let i = 0; i < pc.author_emails.length; i++) {
		let author = await db.collection('user').findOne({ email: pc.author_emails[i] })
		if(author)	authors.push({ id: author._id, can_follow: (user.following.filter(u => u.toString() == author._id.toString()) == 0 && user._id.toString() != author._id.toString()) })
		else authors.push(null)
	}

	pc.author_infos = authors
	pc.canlike = user.likes.filter(l => l.toString() === pc._id.toString()).length === 0
	pc.cansave = user.saves.filter(l => l.toString() === pc._id.toString()).length === 0

	res.status(200).json(pc)
})

// For simplicity, only saving is allowed
router.patch('/podcasts/:id/actions/subscribe', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let pc = await db.collection('podcasts').findOne({ _id: new ObjectID(req.params.id) })
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!pc) {
		res.status(404).json({})
		return
	}

	if(!user) {
		res.status(401).json({})
		return
	}

	user.saves.unshift(pc._id)
	pc.saved += 1

	await db.collection('user').replaceOne({ _id : new ObjectID(user._id) }, user)
	await db.collection('podcasts').replaceOne({ _id: new ObjectID(pc._id) }, pc)

	res.status(200).json({})
})

// For simplicity, only likeing is allowed
router.patch('/podcasts/:id/actions/like', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let pc = await db.collection('podcasts').findOne({ _id: new ObjectID(req.params.id) })
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!pc) {
		res.status(404).json({})
		return
	}

	if(!user) {
		res.status(401).json({})
		return
	}

	user.likes.unshift(pc._id)
	pc.likes += 1

	await db.collection('user').replaceOne({ _id : new ObjectID(user._id) }, user)
	await db.collection('podcasts').replaceOne({ _id: new ObjectID(pc._id) }, pc)

	res.status(200).json({})
})

router.post('/users/:id/actions/follow', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let newFollowing = await db.collection('user').findOne({ _id: new ObjectID(req.params.id) })
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!newFollowing) {
		res.status(404).json({})
		return
	}

	if(!user) {
		res.status(401).json({})
		return
	}

	user.following.unshift(newFollowing._id)
	newFollowing.followed.unshift(user._id)

	await db.collection('user').replaceOne({ _id: user._id }, user)
	await db.collection('user').replaceOne({ _id: newFollowing._id }, newFollowing)

	res.status(200).json({})
})

router.get('/users/:id', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(401).json({})
		return
	}

	let other = await db.collection('user').findOne({ _id: new ObjectID(req.params.id) })

	if(!other) {
		res.status(404).json({})
		return
	}

	other.password = null
	other.can_follow = user.following.filter(u => u.toString() === other._id.toString()).length === 0 &&
											user._id.toString() != other._id.toString()

	await db.collection('user').find({ _id: { $in: other.following.map(i => new ObjectID(i)) }}).toArray(function(err, result) {
		if(err) console.log(err)
		else {
			result.forEach(e => e.password = null)
			other.following = result
		}
	})

	await db.collection('user').find({ _id: { $in: other.followed.map(i => new ObjectID(i)) }}).toArray(function(err, result) {
		if(err) console.log(err)
		else {
			result.forEach(e => e.password = null)
			other.followed = result
			res.status(200).json(other)
		}
	})
})

router.patch('/podcasts/:id', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let pc = await db.collection('podcasts').findOne({ _id: new ObjectID(req.params.id) })

	if(!pc) {
		res.status(404)
		return
	}

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404)
		return
	}

	let data = JSON.parse(Object.keys(req.body)[0])

	let canEdit = pc.author_emails.filter(e => e === user.email).length > 0

	if(!canEdit) {
		res.status(401).json({})
		return
	} 

	pc.title = data.title
	pc.description = data.description
	pc.audio = data.audio
	pc.bibtex = data.bibtex
	pc.url_manuscript = data.url_manuscript
	pc.doi = data.doi
	pc.scientific_disciplines = data.scientific_disciplines
	pc.tags = data.tags
	pc.author_names = data.author_names
	pc.author_emails = data.author_emails

	await db.collection('podcasts').replaceOne({ _id: new ObjectID(pc._id) }, pc)

	res.status(200).json({})
})

// This api is not used in this phase
router.get('/podcasts/:id/comments', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let pc = await db.collection('podcasts').findOne({ _id: new ObjectID(req.params.id) })

	if(!pc) {
		res.status(404)
		return
	}

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404)
		return
	}

	res.status(200).json({ comments: pc.comments })
})

// This api is not used in this phase
router.delete('/podcasts/:id', async function(req, res, next) {
	let db = await getDb()

	if(!req.user) {
		res.status(401).json({})
		return
	}

	let pc = await db.collection('podcasts').findOne({ _id: new ObjectID(req.params.id) })

	if(!pc) {
		res.status(404)
		return
	}

	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(404)
		return
	}

	await db.collection('podcasts').deleteOne({ _id: new ObjectID(pc._id) })
})

// Below are addtional APIs
router.get('/users/:id/podcasts/authored', async function(req, res, next) {
	let db = await getDb()
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(401)
		return
	}

	let other = await db.collection('user').findOne({ _id: new ObjectID(req.params.id) })

	await db.collection('podcasts').find({ _id: { $in: other.uploads.map((e) => new ObjectID(e) ) }}).toArray(function(err, result) {
		if(err) console.log(err)
		else {
			res.status(200).json(result)
		}
	})
})

router.get('/users/:id/podcasts/liked', async function(req, res, next) {
	let db = await getDb()
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(401)
		return
	}

	let other = await db.collection('user').findOne({ _id: new ObjectID(req.params.id) })

	await db.collection('podcasts').find({ _id: { $in: other.likes.map((e) => new ObjectID(e) ) }}).toArray(function(err, result) {
		if(err) console.log(err)
		else {
			res.status(200).json(result)
		}
	})
})

router.get('/users/:id/podcasts/saved', async function(req, res, next) {
	let db = await getDb()
	let user = await db.collection('user').findOne({ _id: new ObjectID(req.user.id) })

	if(!user) {
		res.status(401)
		return
	}

	let other = await db.collection('user').findOne({ _id: new ObjectID(req.params.id) })

	await db.collection('podcasts').find({ _id: { $in: other.saves.map((e) => new ObjectID(e) ) }}).toArray(function(err, result) {
		if(err) console.log(err)
		else {
			res.status(200).json(result)
		}
	})
})

async function getDb() {
	let connection = await conn.getDb()
	let db = await connection.db('learnmongodb')

	return db
}

module.exports = router;