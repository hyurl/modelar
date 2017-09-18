## The Model Class

*Model Wrapper.*

This class extends from Query class, there for has all the features that Query
has, and features that Query doesn't have, which makes data operation more 
easier and efficient.

Also, this class implements some useful API of ES2015, like `toString()`, 
`valueOf()`, `toJSON()`, and `Symbol.iterator`. You can call 
`model.toString()` or `JSON.stringify(model)` to generate a JSON string of 
the model, and call `model.valueOf()` to get the data of the model. If you
want to list out all properties of the model data, put the model in a 
for...of... loop, like `for(let [field, value] of model)`.