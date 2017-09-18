## Model Associations

Modelar provides some methods for you to associate one model to others, in 
general, you can define a property with a setter, such a property can use 
these methods to concatenate models. These methods will generate a `caller` to
to those models when being associated, so that you can access them with the 
current model.