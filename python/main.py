import sys
import json
import clustering as cl

def main():
    arg_len = len(sys.argv)
    dictionary_array = []
    if arg_len > 1:
        for i in range(1, arg_len):
            dictionary_array.append(json.loads(sys.argv[i]))
        res = cl.agglomerative_clustering(dictionary_array)
        print(res)

main()



