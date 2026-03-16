# Media Zone RP — Deploy Guide
## Твоя інфра: Azure K3S + ArgoCD + ghcr.io/fury2701

```
Твій ПК
  → GitHub (fury2701/mediazone)
    → GitHub Actions (build + push)
      → ghcr.io/fury2701/mediazone:sha-xxxxx  ← публічний пакет
        → ArgoCD (бачить нову версію в values.yaml)
          → K3S: MySQL стартує першим
              → initContainer чекає поки MySQL готовий
                → entrypoint.sh: seed() → uvicorn
                  → бекенд живий ✓
            → Nginx на control-node (172.201.251.186:8080)
              → Браузер ✓
```

## Порядок старту (автоматичний, нічого вручну не треба)

```
1. MySQL StatefulSet піднімається (~30-60 сек)
2. initContainer (busybox) в бекенд-поді чекає поки MySQL відповідає на порт 3306
3. Тільки після цього стартує основний контейнер
4. entrypoint.sh:
   а) mysqladmin ping — ще раз перевіряє MySQL (подвійна перевірка)
   б) python seed.py — створює таблиці + seed категорій
   в) uvicorn — запускає API
5. readinessProbe /api/health — K8S чекає відповіді перед тим як пускати трафік
6. Nginx починає проксювати запити
```

---

---

## КРОК 1 — Створи GitHub репо

```bash
# На своєму ПК
git clone https://github.com/fury2701/mediazone   # або
gh repo create fury2701/mediazone --public

cd mediazone
# Скопіюй всі файли з цього архіву сюди
git add .
git commit -m "feat: initial mediazone rp"
git push origin main
```

---

## КРОК 2 — Зміни паролі у values.yaml

```bash
# Відкрий helm/mediazone/values.yaml і заміни:
CHANGE_ME_PASSWORD     → придумай пароль (напр: Mz2025!xK9p)
CHANGE_ME_ROOT_PASSWORD → придумай root пароль
CHANGE_ME_VERY_LONG_RANDOM_STRING_MIN_32_CHARS → будь-який довгий рядок

# Згенерувати безпечний SECRET_KEY:
python3 -c "import secrets; print(secrets.token_hex(32))"
```

> ⚠️ Паролі в values.yaml потрапляють в Git — для production
> краще використовувати Sealed Secrets або External Secrets.
> Для старту — ок.

---

## КРОК 3 — Зареєструй ArgoCD Application

```bash
# SSH на control-node
ssh azureuser@172.201.251.186

# Застосуй ArgoCD app маніфест
kubectl apply -f - <<'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: mediazone
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/fury2701/mediazone
    targetRevision: HEAD
    path: helm/mediazone
    helm:
      valueFiles:
        - values.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: mediazone
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
EOF

# Перевір що ArgoCD побачив застосунок
kubectl get applications -n argocd
```

---

## КРОК 4 — Налаштуй Nginx на control-node

```bash
# SSH на control-node
ssh azureuser@172.201.251.186

# Скопіюй конфіг (або створи вручну)
sudo tee /etc/nginx/sites-available/mediazone > /dev/null <<'EOF'
server {
    listen 8080;
    server_name _;
    location / {
        proxy_pass http://10.1.1.4:30081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/mediazone /etc/nginx/sites-enabled/mediazone
sudo nginx -t && sudo systemctl reload nginx
```

> Сайт буде доступний на: **http://172.201.251.186:8080**

---

## КРОК 5 — Перший деплой (автоматично після пушу)

```bash
# На своєму ПК — просто пушнути main запустить pipeline
git push origin main

# GitHub Actions:
# 1. Запускає тести
# 2. Будує Docker образ
# 3. Пушить → ghcr.io/fury2701/mediazone:sha-abc123
# 4. Оновлює helm/mediazone/values.yaml (tag: "sha-abc123")
# 5. Пушить values.yaml назад в main

# ArgoCD:
# Бачить зміну в values.yaml → автоматично синхронізує K3S
```

Слідкуй за деплоєм:
```bash
# На control-node
kubectl get pods -n mediazone -w

# Очікуваний результат:
# mediazone-backend-xxx   1/1   Running   0   30s
# mediazone-backend-yyy   1/1   Running   0   28s
# mediazone-mysql-0       1/1   Running   0   45s
```

---

## Перевірка після деплою

```bash
# Health check API
curl http://172.201.251.186:8080/api/health
# → {"status":"ok","service":"mediazone-rp"}

# Публічна статистика
curl http://172.201.251.186:8080/api/stats/public

# Swagger документація
# Відкрий в браузері: http://172.201.251.186:8080/docs

# Реєстрація через API
curl -X POST http://172.201.251.186:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@mzrp.com","password":"password123"}'
```

---

## Azure NSG — відкрий порт 8080

Якщо порт недоступний ззовні — додай правило в Azure NSG:

```bash
# Через Azure CLI
az network nsg rule create \
  --resource-group <твій-resource-group> \
  --nsg-name <nsg-control-node> \
  --name AllowMediaZone \
  --priority 310 \
  --destination-port-ranges 8080 \
  --access Allow \
  --protocol Tcp
```

Або в Azure Portal: NSG → Inbound rules → Add → Port 8080.

---

## Корисні команди

```bash
# Логи бекенду
kubectl logs -n mediazone -l app=mediazone-backend --tail=100 -f

# Перезапустити бекенд
kubectl rollout restart deployment/mediazone-backend -n mediazone

# Статус ArgoCD
kubectl get applications -n argocd

# Зайти в MySQL
kubectl exec -it -n mediazone mediazone-mysql-0 -- mysql -u mzrp -p mediazone

# Перевірити сервіс
kubectl get svc -n mediazone
# mediazone-backend   NodePort   ...   8000:30081/TCP
# mysql               ClusterIP  None  3306/TCP
```

---

## Структура API

| Method | Path | Опис |
|--------|------|------|
| GET | `/api/health` | Health check (K8S probes) |
| POST | `/api/auth/register` | Реєстрація |
| POST | `/api/auth/login` | Вхід → JWT токен |
| GET | `/api/auth/me` | Профіль (потрібен Bearer токен) |
| GET | `/api/users/me/characters` | Мої персонажі |
| POST | `/api/users/me/characters` | Створити персонажа |
| GET | `/api/forum/categories` | Категорії форуму |
| GET | `/api/forum/posts` | Пости (з фільтром по category_id) |
| POST | `/api/forum/posts` | Новий пост |
| GET | `/api/forum/posts/{id}/replies` | Відповіді на пост |
| POST | `/api/forum/posts/{id}/replies` | Відповісти на пост |
| GET | `/api/stats/public` | Статистика для головної |
| GET | `/docs` | Swagger UI |
