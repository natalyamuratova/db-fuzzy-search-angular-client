import const

class WagnerPhisherAlgorithm:

    def __init__(self, insert_cost: int, delete_cost: int, replace_cost: int, transposition_cost: int):
        self.insert_cost = insert_cost
        self.delete_cost = delete_cost
        self.replace_cost = replace_cost
        self.transposition_cost = transposition_cost
        self.shortened = True

    def distance(self, a: str, b: str):
        n: int = len(a)
        m: int = len(b)

        if n > m:
            a, b = b, a
            n, m = m, n

        a = a[::-1]
        b = b[::-1]

        current_row = range(n + 1)
        previous_row = []
        # цикл по символам слова b
        for i in range(1, m + 1):
            pre_previous_row = previous_row
            previous_row = current_row
            current_row = [i] * self.insert_cost + [0] * n

            start = 1
            # проверка сокращения слова
            # if b[i - 1] == a[0] and self.shortened:
            #     self.shortened = False
            #     current_row[1] = self.delete_cost
            #     start = 2
            # цикл по символам слова a
            for j in range(start, n + 1):
                add = previous_row[j] + self.delete_cost
                delete = current_row[j - 1] + self.insert_cost
                change = previous_row[j - 1]
                if a[j - 1] != b[i - 1]:
                    change += self.replace_cost
                value = min(add, delete, change)
                # проверка транспозиции символов
                if i >= 2 and j >= 2:
                    if a[j - 1] == b[i - 2] and a[j - 2] == b[i - 1]:
                        value = min(value, pre_previous_row[j - 2] + self.transposition_cost)
                current_row[j] = value

        return current_row[n]

    def distance_with_abbreviation(self, a: str, b: str):
        n, m = len(a), len(b)
        dist = self.distance(a, b)

        # проверка сокращения слова
        if n != m:
            min_len = min(m, n)
            if a[min_len - 1] == b[min_len - 1]:
                short_a = a[:min_len]
                short_b = b[:min_len]
                fake_dist = (self.distance(short_a, short_b) + self.delete_cost)
                if fake_dist < const.match_threshold and fake_dist < dist:
                    dist = fake_dist
        return dist

    def norm_distance(self, a: str, b: str):
        n, m = len(a), len(b)
        max_len = max(n, m)
        norm = self.distance(a, b) / max_len
        return norm * 100

    def common_distance(self, a: str, b: str):
        list1 = a.split()
        list2 = b.split()
        n1 = len(list1)
        n2 = len(list2)
        com_dist = 0
        com_len = 0
        if n1 == n2:
            for i in range(0, n1):
                max_len = max(len(list1[i]), len(list2[i]))
                com_len += max_len
                com_dist += self.distance_with_abbreviation(list1[i], list2[i])
            com_dist /= com_len
            return com_dist * 100

        return self.norm_distance(a, b)

