# SwellBoard

## How to track using Sacred

Each experiment should be the run for a particular model. Therefore,
we expect a particular addition to the configuration. The easiest way
is to run all experiments using `with swell` and define the variable
tag within the named configuration.

```python
@ex.named_config
def swell():
    model_tag = "Neural Network"
```

Several experiments can have the same tag and would ideally
conform to the same structure. For example, the tag _Neural Network_
would group all runs that have been finished using a neural
network model and make them easily comparable. This allows
for simpler structuring of the visualization and selection
of runs and experiments.

Further, we allow for a benchmark of final performance metrics
and correlation with parameters of the run. For this to work
properly, the experiment's main should return the
metrics of interest. The configuration is automatically used
without further adjustment. To return final metrics, the
main of sacred should look as follows

```python
@ex.automain  // or just main
def experiment(**kwargs)
    ...
    // run model and collect metrics and artifacts as usual
    return {
        'acc': x,
        'val-acc': y,
        'metric_1': z,
        'max-acc': max(xs)
    }
```

Ideally, all experiments under one group of model tags should
return the same final metrics to get the most of the comparison.
