# PodScholar_Express_MongoDB

This project is using:
- JWT for authentication
- MongoDB Atlas for using database
- ExpressJS for server-side
- EJS template for rendering HTML, CSS and JS files.

To make some simplicities to this project, there are some notable things:
- An author can only save a podcast once and cannot unsave it.
- An author can only like a podcast once and cannot dislike it.
- An author can only follow another author once and cannot unfollow him/her.
- DELETE api for a podcast is implemented; however, there are not any places call it.
- GET comments for a podcast is implemented; however, there are not any places call it.
- Some specifications are unclear that the front-end will note them with a text.
- Forgot password is not supported, although it appears on the front-end.

Take a visit at: https://pods-cholar.herokuapp.com/
This project is being deployed to Heroku

There are some addtional APIs besides those specified in the requirements:
```html
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
```
