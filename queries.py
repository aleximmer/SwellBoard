import pymongo
import gridfs

uri = 'mongodb://swell:swellboard4tw@188.166.161.172/Swell'
client = pymongo.MongoClient(uri)


metric_names = client['Swell']['runs'].find_one({'_id': 1}, {'info': 1})
print('TEST', set([i['name'] for i in metric_names['info']['metrics']]))

print('/runs')
# /runs
model_name = 'FW-NN'  # given
result = list(client['Swell']['runs'].find({'config.method_tag': 'FW-NN'}, {'config': 1}))
print('/runs', result)


# /results/names given run_ids returning all result keys
run_ids = 3  # given
result = list(client['Swell']['runs'].find_one({'_id': run_ids}, {'result': 1})['result'].keys())
print('/results/names', result)


# /results/scalars  ruN_ids and a result key return the results
result_name = 'Acc Test'  # given
run_ids = [1, 2]  # given
results = dict()
for i in run_ids:
    results[i] = client['Swell']['runs'].find_one({'_id': i}, {'result': 1})['result'][result_name]
print('/results/scalars', results)


# /artifacts  run_id given
run_id = 5
fs = gridfs.GridFS(client['Swell'])
artifacts = list()  # of dict with name and binary
for file in client['Swell']['runs'].find_one({'_id': run_id}, {'artifacts'})['artifacts']:
    if '.png' in file['name']:
        fig = fs.get(file['file_id']).read()
        artifacts.append(fig)
#print('/artifacts', artifacts)


# /params/names given a run_id
run_id = 5
result = client['Swell']['runs'].find_one({'_id': run_id}, {'config': 1})
print('/params/names', result)


# /params/scalars given a run-id and parameter name
run_id = 2
param_name = 'Acc Test'
result = client['Swell']['runs'].find_one({'_id': run_id}, {'result': 1})['result'][param_name]
print('/params/scalars', result)


from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF
import numpy as np

# BayO given params (of config), and result_names as for example just below
params = ['batch_size', 'step_size', 'kappa']
results = ['Loss Test', 'Acc Test', 'Active Paths']

# does the rest
lin = lambda x: np.nan if x is None else x
neglin = lambda x: np.nan if x is None else -lin(x)
ptrans = {
    'kappa': lin,
    'step_size': lin,
    'batch_size': lin,
}
ttrans = {
    'Acc Test': lin,
    'Acc Train': lin,
    'Loss Train': neglin,
    'Loss Test': neglin,
    'Active Nodes': neglin,
    'Active Params': neglin,
    'Active Paths': neglin
}


def sampler(params, n_samples, min_max):
    min_lr, max_lr = min_max.get('step_size', dict()).get('min', 0), \
                     min_max.get('step_size', dict()).get('max', 1)
    min_k, max_k = min_max.get('kappa', dict()).get('min', 1), \
                   min_max.get('kappa', dict()).get('max', 10000)
    min_b, max_b = min_max.get('batch_size', dict()).get('min', 1), \
                   min_max.get('batch_size', dict()).get('max', 512)
    psample = {
        'kappa': np.random.randint(min_k, max_k, n_samples),
        'step_size': min_lr + np.random.rand(n_samples) * (max_lr - min_lr),
        'batch_size': np.random.randint(min_b, max_b+1, n_samples)
    }
    samples = [psample[k] for k in params]
    return np.vstack(samples).T

runs = list(client['Swell']['runs'].find({'status': 'COMPLETED'},
                                         {'config': 1, 'result': 1}))
models = ['FW-NN', 'NN', 'PSGD-NN']
opt_set = dict()
for m in models:
    m_runs = [e for e in runs if e['config']['method_tag'] == m]
    X = [[ptrans[k](d['config'][k]) for k in params] for d in m_runs]
    y = [[ttrans[k](d['result'][k]) for k in results] for d in m_runs]
    X = np.array(X)
    if len(y) <= 1:
        continue
    mask = np.all(~np.isnan(X), axis=0)
    X = X[:, mask]
    xmin, xmax = np.min(X, axis=0), np.max(X, axis=0)
    x_mu, x_std = X.mean(axis=0), X.std(axis=0)
    xz = (x_std == 0)
    x_std[xz] = 1
    X = (X - x_mu) / x_std
    y = np.array(y)
    y_mu, y_std = y.mean(axis=0), y.std(axis=0)
    yz = y_std == 0
    y_std[yz] = 1
    y = (y - y_mu) / y_std
    rbf = RBF(length_scale=1.0)
    gp = GaussianProcessRegressor(kernel=rbf)
    gp.fit(X, y)
    min_max = {k: {'min': xmi, 'max': xma} for k, xmi, xma
               in zip(np.array(params)[mask], xmin, xmax)}
    samples = sampler(np.array(params)[mask], 1000, min_max)
    y_hat = gp.predict((samples - x_mu) / x_std)
    opt_ix = np.argmax(np.sum(y_hat, axis=1))
    y_wt = np.array([(-1 if ttrans[res] == neglin else 1) for res in results])
    y_opt = y_wt * y_hat[opt_ix] * y_std + y_mu
    suboptset = {r: y_opt[i] for i, r in enumerate(results)}
    x_opt = samples[opt_ix] * x_std + x_mu
    prams = np.array(params)[mask]
    for i, p in enumerate(prams):
        suboptset[p] = x_opt[i]
    opt_set[m] = suboptset
    print(opt_set[m])
# return opt_set