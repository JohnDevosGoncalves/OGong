# Migrations Prisma — OGong

## Prérequis : PostgreSQL en local

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Créer la base de données
createdb ogong
```

Mettre à jour le fichier `.env` avec votre URL de connexion :

```
DATABASE_URL="postgresql://votre_user:votre_mot_de_passe@localhost:5432/ogong?schema=public"
```

## Développement

```bash
# Appliquer les migrations et générer le client Prisma
npx prisma migrate dev

# Réinitialiser la base (supprime toutes les données)
npx prisma migrate reset

# Ouvrir Prisma Studio pour explorer les données
npx prisma studio
```

## Seed (données initiales)

Si un fichier `prisma/seed.ts` existe :

```bash
npx prisma db seed
```

## Production

```bash
# Appliquer les migrations sans interaction
npx prisma migrate deploy

# Générer le client Prisma (si nécessaire dans le pipeline CI)
npx prisma generate
```

> **Note :** En production (Vercel), ajouter `?connection_limit=5&pool_timeout=10` à l'URL
> pour limiter le pool de connexions en environnement serverless.
