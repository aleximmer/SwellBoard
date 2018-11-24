import torch
import numpy as np

class WalkFwGenerator():
    
    def __init__(self, X, window=15, n_targets=1):
        self.X = X
        self.window = window
        self.n_targets = n_targets
        self._check_win_size()
        
    def _check_win_size(self):
        if len(self.X) < self.window:
            raise Exception("Dimensionality error with window size: {}, and targets size: {}".format(self.window, self.n_targets))
            
    def _to_torch(self, list):
        return torch.tensor(list).view(-1, 1, 1).float()

    def reset(self):
        for i in range(len(self.X)-self.window):
            yield (self._to_torch(self.X[i:i+self.window]), 
            self._to_torch(np.array(self.X[i+self.window-1])), 
            self._to_torch(np.array(self.X[i+self.window:i+self.window+self.n_targets])))
