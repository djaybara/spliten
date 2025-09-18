import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * /api/comments/count?ids=1,2,3
 * Renvoie : { counts: { "1": 12, "2": 0, "3": 47 } }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = (searchParams.get('ids') || '')
    .split(',')
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n));

  if (!ids.length) {
    return NextResponse.json({ counts: {} });
  }

  const pairs = await Promise.all(
    ids.map(async (id) => [id, await countForQuestion(id)] as const)
  );

  return NextResponse.json({ counts: Object.fromEntries(pairs) });
}

/**
 * ⚙️ Adapte à ton schéma si besoin.
 * Hypothèses raisonnables :
 *  - Modèle Prisma "Comment" avec champ questionId:number
 *  - Optionnel : champ parentId pour distinguer top-level vs réponses
 *  - (Facultatif) Modèle "Discussion" avec questionId
 *
 * Change COUNT_REPLIES si tu veux compter toutes les réponses,
 * ou laisse false pour ne compter que les commentaires top-level.
 */
const COUNT_REPLIES = true; // ← mets false si tu veux seulement les top-level

async function countForQuestion(id: number): Promise<number> {
  // Compte les commentaires (top-level OU tous selon l’option)
  const where = COUNT_REPLIES
    ? { questionId: id }
    : { questionId: id, parentId: null as number | null };

  let comments = 0;
  try {
    comments = await prisma.comment.count({ where } as any);
  } catch {
    // Pas encore de table "Comment" → renvoie 0 pour ne rien casser en dev
    return 0;
  }

  // (Facultatif) ajoute les "discussions" si tu as cette table
  let discussions = 0;
  try {
    const anyPrisma = prisma as any; // évite l'erreur TS si le modèle n'existe pas
    if (anyPrisma.discussion?.count) {
      discussions = await anyPrisma.discussion.count({ where: { questionId: id } });
    }
  } catch {
    discussions = 0;
  }

  return comments + discussions;
}
