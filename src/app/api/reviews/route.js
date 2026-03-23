import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID;

  // Sécurité : on vérifie que les variables sont bien présentes
  if (!apiKey || !placeId) {
    return NextResponse.json(
      { error: 'Configuration API Google manquante' }, 
      { status: 500 }
    );
  }

  try {
    // On cible spécifiquement les "reviews" en français pour alléger la requête
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&language=fr&key=${apiKey}`;

    // La mécanique de cache vitale : 
    // revalidate: 86400 = On garde la réponse en mémoire pendant 24 heures (60s * 60m * 24h)
    const response = await fetch(url, {
      next: { revalidate: 86400 } 
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau Google: ${response.status}`);
    }

    const data = await response.json();

    // Si Google ne trouve pas d'avis, on renvoie un tableau vide pour ne pas faire crasher le front
    if (!data.result || !data.result.reviews) {
      return NextResponse.json([]);
    }

    // On formate les données brutes de Google pour qu'elles correspondent 
    // exactement aux props attendues par notre composant GoogleReviews
    const formattedReviews = data.result.reviews.map((review) => ({
      name: review.author_name,
      photo: review.profile_photo_url,
      rating: review.rating,
      text: review.text,
    }));

    return NextResponse.json(formattedReviews);

  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json(
      { error: 'Impossible de charger les avis' }, 
      { status: 500 }
    );
  }
}