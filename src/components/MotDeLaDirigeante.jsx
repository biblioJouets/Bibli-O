import Image from 'next/image';
import '@/styles/MotDeLaDirigeante.css';

export default function MotDeLaDirigeante() {
  return (
    <section className="dirigeante-section" aria-labelledby="dirigeante-title">
      <div className="dirigeante-container">

        <div className="dirigeante-photo-col">
          <div className="dirigeante-photo-wrapper">
            <Image
              src="/dirigeante.png"
              alt="Portrait de la dirigeante de Bibli'O Jouets"
              width={320}
              height={320}
              className="dirigeante-photo"
            />
            <div className="dirigeante-badge">Fondatrice &amp; Présidente</div>
          </div>
        </div>

        <div className="dirigeante-text-col">
          <div className="dirigeante-quote-mark" aria-hidden="true">&ldquo;</div>
          <h2 id="dirigeante-title" className="dirigeante-title">
            Du salon encombré à l&apos;entrepreneur&nbsp;: Mon voyage de maman
          </h2>

          <p>
            On connaît tous ce sentiment. Ce moment où l&apos;on regarde le salon et où
            l&apos;on a l&apos;impression que les jouets ont pris le pouvoir.
          </p>
          <p>
            Pour moi, tout a commencé dans notre ancien appartement. C&apos;était petit,
            et chaque nouveau jouet semblait grignoter l&apos;espace… ainsi que mon
            énergie. Lyzio se lassait en 5 minutes, et je passais mes journées à
            inventer des activités pour l&apos;occuper. C&apos;était épuisant. Je ressentais
            cette fatigue mentale d&apos;être une «&nbsp;animatrice&nbsp;» permanente, doublée de
            la frustration de ne pas pouvoir lui offrir toute la variété qu&apos;il
            méritait faute de place.
          </p>

          <p className="dirigeante-highlight">
            <strong>Le déclic&nbsp;? Une question toute simple.</strong>
          </p>
          <p>
            J&apos;ai toujours eu cette envie viscérale de créer mon entreprise. Un soir,
            en discutant avec Lucas, je me suis posée la question&nbsp;: «&nbsp;Quel est le
            problème dans ma vie que j&apos;aimerais voir résolu&nbsp;?&nbsp;». La réponse était sous
            mes yeux, éparpillée sur le tapis du salon. Pourquoi posséder, quand on
            peut partager&nbsp;? Pourquoi entasser, quand on peut faire circuler&nbsp;?
            Bibli&apos;o Jouets venait de naître.
          </p>

          <p className="dirigeante-highlight">
            <strong>Entre les nuits hachées et les montagnes à gravir.</strong>
          </p>
          <p>
            Le lancement en janvier 2026 a été un véritable marathon. Être
            Présidente, c&apos;est gravir des montagnes rênes en main, tout en gérant les
            besoins de Lyzio. Vouloir aller vite, tout faire parfaitement, tout en
            restant présente pour son fils… c&apos;est sans doute le défi le plus
            difficile que j&apos;ai eu à relever.
          </p>
          <p>
            Mais aujourd&apos;hui, quand je vois mes affiches dans la rue, quand je vois
            que le concept aide concrètement d&apos;autres familles à souffler, je ressens
            une fierté immense. La liberté de nos enfants (et la nôtre&nbsp;!) commence
            par une consommation plus légère et plus intelligente.
          </p>

          <p className="dirigeante-closing">
            Rejoignez l&apos;aventure, pour vos enfants, pour la planète, et pour votre
            café chaud de demain matin&nbsp;! ☕
          </p>
        </div>

      </div>
    </section>
  );
}
