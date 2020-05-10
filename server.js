const express = require('express');
const expbhs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
app.engine('hbs', expbhs({
	defaultLayout: 'main',
	extname: 'hbs',
	layoutsDir: './views/Layouts',
	partialsDir: './views/Partials',

}));
app.set('view engine', 'hbs');
app.set('Views', './views');
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/',require('./Controllers/Controllers'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));