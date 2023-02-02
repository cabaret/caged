import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import random from 'random'

type Tonality = 'Minor' | 'Major'

type Root = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#'

const ROOT_MAJOR_MINOR_MAP = {
  C: 'A',
  'C#': 'A#',
  D: 'B',
  'D#': 'C',
  E: 'C#',
  F: 'D',
  'F#': 'D#',
  G: 'E',
  'G#': 'F',
  A: 'F#',
  'A#': 'G',
  B: 'G#',
}

const INTERVAL_MAJOR_MINOR_MAP = {
  '0': '0',
  '1': 'b3',
  '2': '4',
  '3': '5',
  '4': 'b6',
  '5': 'b7',
  '6': '1',
  '7': '2',
} as const

const STRINGS_BY_NUMBER = {
  '1': 'E',
  '2': 'B',
  '3': 'G',
  '4': 'D',
  '5': 'A',
  '6': 'E',
} as const

const SHAPES = {
  1: {
    '1': ['0', '7', '1', '0', '2'],
    '2': ['0', '0', '5', '0', '6'],
    '3': ['0', '2', '0', '3', '4'],
    '4': ['0', '6', '0', '7', '1'],
    '5': ['0', '3', '4', '0', '5'],
    '6': ['0', '7', '1', '0', '2'],
  } as const,
  2: {
    '1': ['0', '2', '0', '3', '4'],
    '2': ['0', '6', '0', '7', '1'],
    '3': ['3', '4', '0', '5', '0'],
    '4': ['7', '1', '0', '2', '0'],
    '5': ['0', '5', '0', '6', '0'],
    '6': ['0', '2', '0', '3', '4'],
  } as const,
  3: {
    '1': ['0', '3', '4', '0', '5'],
    '2': ['0', '7', '1', '0', '2'],
    '3': ['0', '5', '0', '6', '0'],
    '4': ['0', '2', '0', '3', '4'],
    '5': ['0', '6', '0', '7', '1'],
    '6': ['0', '3', '4', '0', '5'],
  } as const,
  4: {
    '1': ['0', '5', '0', '6', '0'],
    '2': ['0', '2', '0', '3', '4'],
    '3': ['6', '0', '7', '1', '0'],
    '4': ['3', '4', '0', '5', '0'],
    '5': ['7', '1', '0', '2', '0'],
    '6': ['0', '5', '0', '6', '0'],
  } as const,
  5: {
    '1': ['0', '6', '0', '7', '1'],
    '2': ['0', '3', '4', '0', '5'],
    '3': ['7', '1', '0', '2', '0'],
    '4': ['0', '5', '0', '6', '0'],
    '5': ['0', '2', '0', '3', '4'],
    '6': ['0', '6', '0', '7', '1'],
  } as const,
}

type Position = keyof typeof SHAPES

const DEFAULT_TIMER = 60

function App() {
  const [tonality, setTonality] = useState<Tonality>('Major')
  const [position, setPosition] = useState<Position>(1)
  const [pentatonic, setPentatonic] = useState<boolean>(false)
  const [showShape, setShowShape] = useState<boolean>(true)
  const timer = useRef<number>()
  const countdown = useRef<number>()
  const [seconds, setSeconds] = useState<number>(DEFAULT_TIMER)
  const [root, setRoot] = useState<Root>('C')

  const clearTimer = (ref: React.MutableRefObject<number | undefined>) => {
    clearInterval(ref.current)
    ref.current = undefined
  }

  const renderFret = (f: string) => {
    if (f === '0') return undefined
    if (pentatonic) {
      if (f === '4' || f === '7') return undefined
    }
    if (tonality === 'Minor') return INTERVAL_MAJOR_MINOR_MAP[f as keyof typeof INTERVAL_MAJOR_MINOR_MAP]
    else return f
  }

  useEffect(() => {
    if (seconds === 0) {
      stop()
      start()
    }
  }, [seconds])

  const randomize = (): void => {
    const nextPosition = random.int(1, 5)
    const nextTonality = random.choice<Tonality>(['Major', 'Minor'])
    const nextRoot = random.choice<Root>(['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'])

    if (nextPosition !== position && nextTonality && nextRoot) {
      setPosition(nextPosition as Position)
      setTonality(nextTonality)
      setRoot(nextRoot)
      return
    }
    return randomize()
  }

  const start = () => {
    if (timer.current || countdown.current) {
      clearTimer(countdown)
      clearTimer(timer)
    }

    countdown.current = setInterval(() => {
      setSeconds(seconds => seconds - 1)
    }, 1000)

    randomize()
    timer.current = setInterval(() => {
      randomize()
    }, DEFAULT_TIMER * 1000)
  }

  const stop = () => {
    setSeconds(DEFAULT_TIMER)
    clearTimer(countdown)
    clearTimer(timer)
  }

  return (
    <div className='flex flex-col items-center justify-center gap-8 mt-8'>
      <div className='flex gap-2 flex-wrap items-center justify-center px-8'>
        <label htmlFor='tonality' className='flex gap-1'>
          <strong>Tonality:</strong>
          <select
            name='tonality'
            id='tonality'
            onChange={e => setTonality(e.target.value as Tonality)}
            value={tonality}
          >
            <option value='Major'>Major</option>
            <option value='Minor'>Minor</option>
          </select>
        </label>
        <label htmlFor='position' className='flex gap-1'>
          <strong>Position:</strong>
          <select
            name='position'
            id='position'
            onChange={e => setPosition(Number(e.target.value) as Position)}
            value={position}
          >
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
          </select>
        </label>
        <label htmlFor='root' className='flex gap-1'>
          <strong>Root:</strong>
          <select name='root' id='root' onChange={e => setRoot(e.target.value as Root)} value={root}>
            <option value='A'>A</option>
            <option value='A#'>A#</option>
            <option value='B'>B</option>
            <option value='C'>C</option>
            <option value='C#'>C#</option>
            <option value='D'>D</option>
            <option value='D#'>D#</option>
            <option value='E'>E</option>
            <option value='F'>F</option>
            <option value='F#'>F#</option>
            <option value='G'>G</option>
            <option value='G#'>G#</option>
          </select>
        </label>

        <label htmlFor='pentatonic' className='flex gap-2 items-center'>
          <strong>Pentatonic:</strong>
          <input
            type='checkbox'
            value='pentatonic'
            id='pentatonic'
            className='mt-px'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPentatonic(e.target.checked)}
          />
        </label>

        <label htmlFor='showShape' className='flex gap-2 items-center'>
          <strong>Show shape:</strong>
          <input
            type='checkbox'
            value='showShape'
            id='showShape'
            className='mt-px'
            defaultChecked={showShape}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShowShape(e.target.checked)}
          />
        </label>
      </div>

      <div className='flex gap-1 flex-col'>
        <h2 className='mb-12 text-3xl justify-center flex'>
          Position {position}
          {pentatonic && ' pentatonic'}: play in {tonality === 'Minor' ? `${ROOT_MAJOR_MINOR_MAP[root]}m` : root}
        </h2>
        {showShape &&
          Object.entries(SHAPES[position]).map(([n, s], sIdx) => (
            <div className='flex gap-8 items-center justify-center mt-2' key={sIdx}>
              {(s as string[]).map((f, fIdx) => (
                <span
                  key={`${sIdx}-${fIdx}`}
                  className={classNames(
                    ['p-2', 'w-10', 'h-10', 'inline-flex', 'rounded-full', 'justify-center', 'items-center'],
                    {
                      'bg-slate-600': renderFret(f),
                      'bg-red-500':
                        tonality === 'Minor'
                          ? INTERVAL_MAJOR_MINOR_MAP[f as keyof typeof INTERVAL_MAJOR_MINOR_MAP] === '1'
                          : f === '1',
                      'text-white': true,
                    },
                  )}
                >
                  {renderFret(f)}
                </span>
              ))}
            </div>
          ))}
      </div>

      <div className='flex gap-4 mt-4'>
        <button
          className='bg-gray-400 text-white rounded-md p-4 hover:bg-gray-600 transition-all hover:shadow-md'
          onClick={() => {
            stop()
            randomize()
          }}
        >
          Randomize
        </button>
        <button
          className='bg-gray-400 text-white rounded-md p-4 hover:bg-gray-600 transition-all hover:shadow-md'
          onClick={start}
        >
          Start
        </button>
        <button
          disabled={!timer.current || !countdown.current}
          className='bg-gray-400 text-white rounded-md p-4 hover:bg-gray-600 transition-all hover:shadow-md disabled:bg-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-200'
          onClick={stop}
        >
          Stop
        </button>
      </div>
      <div className='text-xl'>
        Timer: <strong>{seconds}</strong> seconds left
      </div>
    </div>
  )
}

export default App
