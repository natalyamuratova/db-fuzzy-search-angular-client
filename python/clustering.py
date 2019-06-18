import numpy as np
import string
import sklearn.cluster as cl
import markov_clustering as mc
from wagner_phisher_algorithm import WagnerPhisherAlgorithm
import const


def affinity_propagation(words):
    lev_similarity = -1 * np.array(similarity_matrix(words))
    affprop = cl.AffinityPropagation(affinity="precomputed")
    affprop.fit(lev_similarity)
    labels = affprop.labels_
    print(labels)
    return labels


def markov(words):
    lev_similarity = np.array(similarity_matrix(words))
    markov_cl = mc.run_mcl(lev_similarity)
    clusters = mc.get_clusters(markov_cl)
    return clusters


def agglomerative_clustering(words):
    lev_similarity = np.array(similarity_matrix(words))
    agl_cl = cl.AgglomerativeClustering(affinity='precomputed', linkage='complete',
                                        distance_threshold=const.match_threshold, n_clusters=None)
    agl_cl.fit(lev_similarity)
    labels = agl_cl.labels_
    return labels.tolist()


def dbscan(words):
    lev_similarity = np.array(similarity_matrix(words))
    dbscan_cl = cl.DBSCAN(eps=const.match_threshold, min_samples=1, metric="precomputed", n_jobs=-1)
    dbscan_cl.fit(lev_similarity)
    labels = dbscan_cl.labels_
    return labels


def similarity_matrix(dictionary):
    wpa = WagnerPhisherAlgorithm(1, 1, 1, 1)
    sim_matrix = []
    matrix_size = len(dictionary)
    table = str.maketrans({key: None for key in string.punctuation})

    for i in range(0, matrix_size):
        sim_matrix.append([])
        words1 = dictionary[i]
        isArray = type(words1) == list
        words_count = len(words1) if isArray else 1
        for words2 in dictionary:
            common_sim = 0
            if isArray:
                for j in range(0, words_count):
                    norm_w1 = words1[j].translate(table).lower()
                    norm_w2 = words2[j].translate(table).lower()
                    common_sim += wpa.common_distance(norm_w1, norm_w2)
            else:
                norm_w1 = words1.translate(table).lower()
                norm_w2 = words2.translate(table).lower()
                common_sim = wpa.common_distance(norm_w1, norm_w2)
            sim_matrix[i].append(common_sim / words_count)

    return sim_matrix
