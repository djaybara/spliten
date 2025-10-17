#!/bin/bash
# scripts/debug-prisma.sh
# Diagnostic complet de Prisma

echo "🔍 DIAGNOSTIC PRISMA"
echo "===================="

echo ""
echo "1️⃣ Vérifier .env existe..."
if [ -f .env ]; then
  echo "✅ .env trouvé"
  echo "📋 DATABASE_URL défini :"
  grep "DATABASE_URL" .env | sed 's/:.*/:*****/' # Cache le mot de passe
else
  echo "❌ .env MANQUANT !"
  echo "➡️ Crée un fichier .env avec DATABASE_URL"
fi

echo ""
echo "2️⃣ Vérifier schema.prisma..."
if [ -f prisma/schema.prisma ]; then
  echo "✅ schema.prisma trouvé"
  echo "📋 Provider :"
  grep "provider" prisma/schema.prisma | head -1
else
  echo "❌ schema.prisma MANQUANT !"
fi

echo ""
echo "3️⃣ Test connexion PostgreSQL..."
if command -v psql &> /dev/null; then
  # Extraire les infos de DATABASE_URL
  DB_URL=$(grep "DATABASE_URL" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  echo "🔗 Tentative de connexion..."
  echo "$DB_URL" | grep -q "postgresql://" && echo "Format PostgreSQL détecté" || echo "⚠️ Format URL suspect"
else
  echo "⚠️ psql non installé (optionnel)"
fi

echo ""
echo "4️⃣ Vérifier node_modules..."
if [ -d node_modules/.prisma ]; then
  echo "✅ Client Prisma généré"
  ls -lh node_modules/.prisma/client/ | head -5
else
  echo "❌ Client Prisma MANQUANT !"
  echo "➡️ Lance : npx prisma generate"
fi

echo ""
echo "5️⃣ Vérifier migrations..."
if [ -d prisma/migrations ]; then
  echo "✅ Dossier migrations trouvé"
  echo "📋 Dernières migrations :"
  ls -lt prisma/migrations | head -5
else
  echo "⚠️ Aucune migration trouvée"
  echo "➡️ Lance : npx prisma migrate dev"
fi

echo ""
echo "6️⃣ Test connexion DB avec Prisma..."
echo "➡️ Lance manuellement : npx prisma db pull"
echo "   (Si ça marche, ta DB est OK)"

echo ""
echo "===================="
echo "🎯 ACTIONS RECOMMANDÉES :"
echo ""
echo "Si DATABASE_URL manque :"
echo "  echo 'DATABASE_URL=\"postgresql://user:pass@localhost:5432/spliten\"' > .env"
echo ""
echo "Si client Prisma manque :"
echo "  npx prisma generate"
echo ""
echo "Si DB existe mais pas de tables :"
echo "  npx prisma migrate dev"
echo ""
echo "Si tout est OK mais ça ne marche pas :"
echo "  pkill -9 node && rm -rf .next && npm run dev"