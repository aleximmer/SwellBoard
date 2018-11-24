import torch
import torch.nn as nn
import torch.nn.functional as F

class EncoderRNN(nn.Module):
    def __init__(self, input_size, hidden_size, device, dropout_p=0.3):
        super(EncoderRNN, self).__init__()
        self.device = device
        self.hidden_size = hidden_size
        self.dropout_p = dropout_p
        self.gru_0 = nn.GRU(input_size, hidden_size)
        self.gru_1 = nn.GRU(hidden_size, hidden_size)
        self.dropout = nn.Dropout(self.dropout_p)
        
    def forward(self, input, hidden):
        output, hidden = self.gru_0(input, hidden)
        output = self.dropout(output)
        output, hidden = self.gru_1(output, hidden)
        output = self.dropout(output)
        output, hidden = self.gru_1(output, hidden)
        output = self.dropout(output)
        output, hidden = self.gru_1(output, hidden)
        return output, hidden

    def initHidden(self):
        return torch.zeros(1, 1, self.hidden_size, device=self.device)