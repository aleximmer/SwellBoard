import pymongo
import gridfs

uri = ''
client = pymongo.MongoClient(uri)


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
