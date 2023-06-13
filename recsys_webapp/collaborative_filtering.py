import torch
import torch.nn as nn
import pandas as pd


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

COLLAB_PATH = "collab_filtering/"

clothes = pd.read_csv(COLLAB_PATH + "clothes.csv")


class FMModel(nn.Module):
    def __init__(self, n, k):
        super().__init__()

        self.w0 = nn.Parameter(torch.zeros(1))
        self.bias = nn.Embedding(n, 1)

        # При передаче индекса в Embedding слой,
        # он использует этот индекс для извлечения соответствующего вектора из матрицы
        # и возвращает его
        self.embeddings = nn.Embedding(n, k)

        with torch.no_grad(): trunc_normal_(self.embeddings.weight, std=0.01)
        with torch.no_grad(): trunc_normal_(self.bias.weight, std=0.01)

    def forward(self, X):
        emb = self.embeddings(X)
        pow_of_sum = emb.sum(dim=1).pow(2)
        sum_of_pow = emb.pow(2).sum(dim=1)
        pairwise = (pow_of_sum - sum_of_pow).sum(1) * 0.5
        bias = self.bias(X).squeeze().sum(1)
        return torch.sigmoid(self.w0 + bias + pairwise) * 5.5


def trunc_normal_(x, mean=0., std=1.):
    return x.normal_().fmod_(2).mul_(std).add_(mean)


model = FMModel(torch.tensor(8078) + 1, 120).to(device)
model.load_state_dict(torch.load(COLLAB_PATH + "clothes_recsys_model2"))
model.eval()

clothes_embeddings = model.embeddings(torch.tensor(clothes["clothes_id"].values, device=device).long())


# Получает список наименований изображений
def get_collab_recommendations(rated_clothes_dict):
    rated_clothes_name = rated_clothes_dict.keys()
    clothes_ratings = list(rated_clothes_dict.values())

    rated_clothes = []

    for name in rated_clothes_name:
        rated_clothes.append(int(clothes[clothes["image_id"] == name]["clothes_id"].iloc[0]))

    mega_embedding = 0

    for i, rated in enumerate(rated_clothes):
        mega_embedding += int(clothes_ratings[i]) / 6 * (model.embeddings(torch.tensor(rated, device=device)))

    clothes_biases = model.bias(torch.tensor(clothes["clothes_id"].values, device=device))

    rankings = clothes_biases.squeeze() + (mega_embedding * clothes_embeddings).sum(1)
    top = [i for i in clothes.iloc[rankings.argsort(descending=True).cpu()]['image_id'].values]
    top = [i for i in top if i not in rated_clothes_name][:10]

    return top
