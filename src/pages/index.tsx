import { useContext } from 'react';
import { GetStaticProps } from 'next';
import Image from 'next/image'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { PlayerContext } from '../contexts/PlayerContext';

import styles from './home.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[]
  allEpisodes: Episode[]
}

export default function Home({ latestEpisodes ,allEpisodes }: HomeProps) {
  const { play } = useContext(PlayerContext)

  return (
    <div className={styles.homepage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map(episode => {
              return (
                <li key={episode.id}>
                  <Image 
                    width={192} 
                    height={192} 
                    src={episode.thumbnail} 
                    alt={episode.title} 
                    objectFit="cover"
                  />

                  <div className={styles.episodeDetails}>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button" onClick={() => play(episode)}>
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </li>
              )
            })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allEpisodes.map(episode => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 72 }}>
                      <Image 
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button">
                        <img src="/play-green.svg" alt="Tocar episódio"/>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
        </table>
      </section>
    </div>
  )
}
 export const getStaticProps: GetStaticProps = async () => {
   const { data } = await api.get('episodes', {
     params: {
       _limit: 12,
       _sort: 'publised_at',
       _order: 'desc'
     }
   });

   const episodes = data.map(episode => {
     return {
       id: episode.id,
       title: episode.title,
       thumbnail: episode.thumbnail,
       members: episode.members,
       publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
       duration: Number(episode.file.duration),
       durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
       url: episode.file.url
     }
   })

   const latestEpisodes = episodes.slice(0, 2)
   const allEpisodes = episodes.slice(2, episodes.length)

   return {
     props: {
      latestEpisodes,
      allEpisodes,
     },
     revalidate: 60 * 60 * 8,
   }
 }