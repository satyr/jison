var assert = require("assert"),
    bnf = require("../../lib/jison/bnf"),
    json2jison = require("../../lib/jison/json2jison");

exports["test basic grammar"] = function () {
    var grammar = "%% test: foo bar | baz ; hello: world ;";
    var expected = {bnf: {test: ["foo bar", "baz"], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test multiple same rule"] = function () {
    var grammar = "%% test: foo bar | baz ; test: world ;";
    var expected = {bnf: {test: ["foo bar", "baz", "world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test classy grammar"] = function () {
    var grammar = "%%\n\npgm \n: cdl MAIN LBRACE vdl el RBRACE ENDOFFILE \n; cdl \n: c cdl \n| \n;";
    var expected = {bnf: {pgm: ["cdl MAIN LBRACE vdl el RBRACE ENDOFFILE"], cdl: ["c cdl", ""]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test advanced grammar"] = function () {
    var grammar = "%% test: foo bar {action} | baz ; hello: world %prec UMINUS ;extra: foo %prec '-' {action} ;";
    var expected = {bnf: {test: [["foo bar", "action" ], "baz"], hello: [[ "world", {prec:"UMINUS"} ]], extra: [[ "foo", "action", {prec: "-"} ]]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test nullable rule"] = function () {
    var grammar = "%% test: foo bar | ; hello: world ;";
    var expected = {bnf: {test: ["foo bar", ""], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test nullable rule with action"] = function () {
    var grammar = "%% test: foo bar | {action}; hello: world ;";
    var expected = {bnf: {test: ["foo bar", [ "", "action" ]], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test nullable rule with %{ %} delimited action"] = function () {
    var grammar = "%% test: foo bar | %{action{}%}; hello: world ;";
    var expected = {bnf: {test: ["foo bar", [ "", "action{}" ]], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test nullable rule with {{ }} delimited action"] = function () {
    var grammar = "%% test: foo bar | {{action{};}}; hello: world ;";
    var expected = {bnf: {test: ["foo bar", [ "", "action{};" ]], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test rule with {{ }} delimited action"] = function () {
    var grammar = "%% test: foo bar {{ node({}, node({})); }}; hello: world ;";
    var expected = {bnf: {test: [["foo bar"," node({}, node({})); " ]], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test comment"] = function () {
    var grammar = "/* comment */ %% hello: world ;";
    var expected = {bnf: {hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test single line comment"] = function () {
    var grammar = "//comment \n %% hello: world ;";
    var expected = {bnf: {hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parse comment");
};

exports["test comment with nested *"] = function () {
    var grammar = "/* comment * not done */ %% hello: /* oh hai */ world ;";
    var expected = {bnf: {hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test token"] = function () {
    var grammar = "%token blah\n%% test: foo bar | baz ; hello: world ;";
    var expected = {bnf: {test: ["foo bar", "baz"], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test token with type"] = function () {
    var grammar = "%type <type> blah\n%% test: foo bar | baz ; hello: world ;";
    var expected = {bnf: {test: ["foo bar", "baz"], hello: ["world"]}};

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};

exports["test embedded lexical block"] = function () {
    var grammar = "%lex  \
                   %%\
                   'foo' {return 'foo';}\
                   'bar' {return 'bar';}\
                   'baz' {return 'baz';}\
                   'world' {return 'world';}\
                   /lex\
                   %% test: foo bar | baz ; hello: world ;";
    var expected = {
                        lex: {
                            rules: [
                               ["foo\\b", "return 'foo';"],
                               ["bar\\b", "return 'bar';"],
                               ["baz\\b", "return 'baz';"],
                               ["world\\b", "return 'world';"]
                            ]
                        },
                        bnf: {test: ["foo bar", "baz"], hello: ["world"]}
                    };

    assert.deepEqual(bnf.parse(grammar), expected, "grammar should be parsed correctly");
};
