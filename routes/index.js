
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Examples' });
};

exports.docs  = function(req, res) {
	res.render('docs/doc' +  req.params.id, { title: 'Doc ' + req.params.id });
};

exports.examples  = function(req, res) {
	res.render('examples/example' +  req.params.id, { title: 'Example ' + req.params.id });
};

exports.templates  = function(req, res) {
	res.render('templates/template' +  req.params.id, {});
};