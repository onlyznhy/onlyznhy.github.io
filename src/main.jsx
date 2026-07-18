import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import heroSystemMap from './assets/hero-system-map.webp'
import caimayoLogo from './assets/caimayo-logo.webp'
import workSlide1 from './assets/portfolio/work-slide-1.png'
import workSlide2 from './assets/portfolio/work-slide-2.png'
import workSlide3 from './assets/portfolio/work-slide-3.png'
import workSlide4 from './assets/portfolio/work-slide-4.png'
import workSlide5 from './assets/portfolio/work-slide-5.png'
import workSlide6 from './assets/portfolio/work-slide-6.png'
import workSlide3Demo from './assets/portfolio/work-slide-3-demo.gif'
import Lanyard from './Lanyard'
import SplitText from './SplitText'
import TextType from './TextType'
import Stack from './Stack'
import { isSupabaseConfigured, supabase } from './supabaseClient'

const FEISHU_DOC_URL = 'https://scnkvd3lzoch.feishu.cn/docx/VqW4doj47oPJHdxKu9WcLTKmn5d?from=from_copylink'
const ROBOT_REPORT_URL = '/reports/humanoid-robot-competitive-landscape-report.html'

const experiences = [
  {
    period: '大学以前',
    title: '我不是小镇做题家',
    text: '成长、选择、转折和那些暂时还没整理好的故事。',
    status: '敬请期待'
  },
  {
    period: '本科期间',
    title: '班门弄斧，跃跃欲试',
    text: '课程、社团、尝试、项目和一次次把自己推到台前。',
    status: '敬请期待'
  },
  {
    period: '研究生阶段',
    title: '科研、实习与重新理解问题',
    text: '科研生活、实习、面临就业、思想的转变与定不下来心的迷茫。',
    status: '持续更新'
  }
]

const projects = [
  {
    type: '作品 1',
    title: '微信 AI 随手记',
    summary: '微信一键转发的习惯：自动记录、智能分类、快速检索',
    content: [
      { kind: 'image', src: workSlide1, alt: '微信 AI 随手记展示页 1' },
      { kind: 'image', src: workSlide2, alt: '微信 AI 随手记展示页 2' }
    ]
  },
  {
    type: '作品 2',
    title: 'Design-generator',
    summary: '一个聪明的设计风格抓取与生成skill & design-generator to Figma (附实操文档)',
    content: [
      {
        kind: 'composite',
        src: workSlide3,
        alt: 'Skills 开发展示页 1',
        label: 'PPT 第 3 页',
        overlays: [
          {
            src: workSlide3Demo,
            alt: 'Skills 开发动态演示',
            style: { left: '2.64%', top: '20.87%', width: '43.85%', height: '58.46%' }
          }
        ]
      },
      { kind: 'image', src: workSlide4, alt: 'Skills 开发展示页 2' },
      { kind: 'image', src: workSlide5, alt: 'Skills 开发展示页 3' },
      { kind: 'link', href: FEISHU_DOC_URL, label: '打开完整飞书文档', note: '第 5 页相关文档会在新标签页打开。' }
    ]
  },
  {
    type: '作品 3',
    title: '竞品格局分析',
    summary: 'Competitive-landscape skill——全球人形机器人企业分布、产品矩阵、商业化阶段与竞争定位',
    content: [
      { kind: 'image', src: workSlide6, alt: '人形机器人行业竞品分析过程介绍' },
      { kind: 'link', href: ROBOT_REPORT_URL, label: '打开完整 HTML 报告', note: '也可以在下方窗口内直接滑动阅读。' },
      {
        kind: 'iframe',
        src: ROBOT_REPORT_URL,
        title: '人形机器人行业竞品分析报告'
      }
    ]
  }
]

const photoModules = Object.entries(
  import.meta.glob(
    ['./assets/photos/*.{jpg,jpeg,png,webp,gif}', '!./assets/photos/6.jpg', '!./assets/photos/7.jpg', '!./assets/photos/9.jpg'],
    {
      eager: true,
      import: 'default'
    }
  )
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))

const photoSources = photoModules
  .filter(([file]) => {
    const webpFile = file.replace(/\.(jpe?g|png)$/i, '.webp').toLowerCase()
    return file.toLowerCase().endsWith('.webp') || !photoModules.some(([candidate]) => candidate.toLowerCase() === webpFile)
  })
  .map(([, src]) => src)

function App() {
  const [activeProject, setActiveProject] = useState(null)
  const [viewerExpanded, setViewerExpanded] = useState(false)
  const viewerScrollRef = useRef(null)
  const [contactFlipped, setContactFlipped] = useState(false)
  const [liked, setLiked] = useState(() => localStorage.getItem('caimayo-liked') === 'true')
  const [likes, setLikes] = useState(0)
  const [likePending, setLikePending] = useState(false)
  const [adviceStatus, setAdviceStatus] = useState('')
  const [advicePending, setAdvicePending] = useState(false)

  useEffect(() => {
    if (!activeProject) return undefined

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setActiveProject(null)
      }
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProject])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    let cancelled = false

    const loadLikes = async () => {
      const { data, error } = await supabase.from('site_stats').select('likes').eq('id', 'main').maybeSingle()
      if (cancelled || error || typeof data?.likes !== 'number') return
      setLikes(data.likes)
    }

    loadLikes()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setViewerExpanded(false)
    window.requestAnimationFrame(() => {
      if (viewerScrollRef.current) {
        viewerScrollRef.current.scrollTop = 0
      }
    })
  }, [activeProject])

  const likeLabel = useMemo(() => (liked ? '已收到你的好运' : '给我点赞'), [liked])
  const stackCards = useMemo(
    () =>
      photoSources.map((src, index) => (
        <div className="stack-photo-card" key={src}>
          <img src={src} alt={`生活照片 ${index + 1}`} />
        </div>
      )),
    []
  )

  const handleLike = async () => {
    if (liked || likePending) return

    if (isSupabaseConfigured) {
      setLikePending(true)
      const { data, error } = await supabase.rpc('increment_like_count')
      setLikePending(false)

      if (!error && typeof data === 'number') {
        setLiked(true)
        setLikes(data)
        localStorage.setItem('caimayo-liked', 'true')
      }

      return
    }

    const next = likes + 1
    setLiked(true)
    setLikes(next)
    localStorage.setItem('caimayo-liked', 'true')
  }

  const handleAdviceSubmit = async () => {
    const field = document.querySelector('.message-panel textarea')
    const content = field?.value.trim() || ''

    if (!content) {
      setAdviceStatus('请先写一点内容。')
      return
    }

    if (!isSupabaseConfigured) {
      setAdviceStatus('留言功能还没有连接 Supabase，先在 .env 里配置项目地址和 anon key。')
      return
    }

    setAdvicePending(true)
    setAdviceStatus('')

    const { error } = await supabase.from('advice_messages').insert({ content })
    setAdvicePending(false)

    if (error) {
      setAdviceStatus('提交失败，请稍后再试。')
      return
    }

    if (field) field.value = ''
    setAdviceStatus('已提交，感谢您的留言！')
  }

  return (
    <main>
      <nav className="top-nav" aria-label="主导航">
        <a className="brand" href="#hero" aria-label="返回主页">
          <span className="brand-text">CaiMayo 的个人网站</span>
        </a>
        <div className="nav-links">
          <a href="#hero">主页</a>
          <a href="#about">关于我</a>
          <a href="#work">作品集</a>
          <a href="#contact">联系</a>
        </div>
        <a className="nav-cta" href="#contact">
          提出建议
        </a>
      </nav>

      <section className="hero" id="hero" style={{ '--hero-image': `url(${heroSystemMap})` }}>
        <div className="hero-content">
          <p className="eyebrow">CAI MAYO · 2027</p>
          <h1 className="hero-title">
            <SplitText text="hello,you!" />
          </h1>
          <p className="hero-lead">
            <TextType text="欢迎来到CaiMayo的个人空间，希望能给您带来好心情~" />
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#about">
              了解我
            </a>
            <a className="button secondary" href="#work">
              作品集
            </a>
          </div>
        </div>

        <div className="hero-lanyard" aria-hidden="true">
          <Lanyard
            position={[0, 0, 31]}
            gravity={[0, -34, 0]}
            fov={20}
            frontImage={caimayoLogo}
            backImage={caimayoLogo}
            imageFit="contain"
            lanyardWidth={0.62}
            cardScale={1.5}
          />
        </div>
      </section>

      <section className="section intro" id="about">
        <div className="section-kicker">ABOUT</div>
        <div className="intro-grid">
          <div>
            <h2>
              <SplitText text="个人信息" triggerOnView />
            </h2>
            <p>
              深圳大学，研二在校，正处迷茫期~<br />
              喜欢社交，也喜欢独处；<br />
              喜欢咖啡探店，也喜欢深夜小酌。<br />
              兴趣爱好广泛，徒步爬山、吉他弹唱、篮球羽毛球、骑行跑步~
            </p>
            <p className="self-comment">自我评价：自命不凡，却平平无奇。</p>
            <div className="like-card">
              <button
                className="heart-button"
                type="button"
                onClick={handleLike}
                disabled={liked || likePending}
                aria-label={likeLabel}
                title={likeLabel}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
              <div>
                <span>{likes}</span>
                <p>{likeLabel}</p>
              </div>
            </div>
          </div>

          <div className="stack-stage" aria-label="生活照片">
            <Stack
              randomRotation
              sensitivity={170}
              sendToBackOnClick
              autoplay
              autoplayDelay={1500}
              pauseOnHover
              mobileClickOnly
              cards={stackCards}
            />
          </div>
        </div>
      </section>

      <section className="section method" id="experience">
        <div className="section-head compact-head">
          <div>
            <div className="section-kicker">EXPERIENCE</div>
            <h2>
              <SplitText text="我的经历" triggerOnView />
            </h2>
          </div>
        </div>

        <div className="experience-grid">
          {experiences.map((item, index) => (
            <article className={`experience-card ${index === 2 ? 'wide' : ''}`} key={item.title}>
              <div className="project-topline">
                <span>{item.period}</span>
                <span>{item.status}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section work" id="work">
        <div className="section-head compact-head">
          <div>
            <div className="section-kicker">PORTFOLIO</div>
            <h2>
              <SplitText text="作品集" triggerOnView />
            </h2>
          </div>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => (
            <button
              className={`project-card ${['cyan', 'amber', 'blue'][index]}`}
              type="button"
              key={project.title}
              onClick={() => {
                setActiveProject(project)
                setViewerExpanded(false)
              }}
              aria-label={`打开${project.title}作品展示`}
            >
              <div className="project-topline">
                <span>{project.type}</span>
                <span>作品 {index + 1}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <span className="project-open-hint">打开作品</span>
            </button>
          ))}
        </div>
      </section>

      <section className="closing" id="contact">
        <div className="section-head compact-head closing-head">
          <div>
            <div className="section-kicker">MESSAGE</div>
            <h2>
              <SplitText text="联系我" triggerOnView />
            </h2>
          </div>
        </div>
        <div className="closing-grid">
          <button
            className={`flip-contact ${contactFlipped ? 'is-flipped' : ''}`}
            type="button"
            onClick={() => setContactFlipped(value => !value)}
            aria-label="查看邮箱"
          >
            <span className="flip-inner">
              <span className="flip-face flip-front">
                <span className="contact-pulse" aria-hidden="true" />
                <strong>联系我</strong>
                <small>点一下看看邮箱</small>
              </span>
              <span className="flip-face flip-back">
                <strong>caimayo@163.com</strong>
                <small>欢迎交流、合作和建议</small>
              </span>
            </span>
          </button>

          <div className="contact-panel message-panel">
            <p className="section-kicker">ADVICE</p>
            <h2>想对我说</h2>
            <textarea placeholder="欢迎留言、建议，或单纯祝我好运！" />
            <button className="button primary" type="button" onClick={handleAdviceSubmit} disabled={advicePending}>
              提交留言
            </button>
            {adviceStatus && <p className="message-status">{adviceStatus}</p>}
          </div>
        </div>
      </section>

      {activeProject && (
        <div
          className={`modal-backdrop ${viewerExpanded ? 'is-expanded' : ''}`}
          role="presentation"
          onClick={() => setActiveProject(null)}
        >
          <section
            className={`project-modal project-viewer ${viewerExpanded ? 'is-expanded' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProject.title}作品展示`}
            onClick={event => event.stopPropagation()}
          >
            <div className="viewer-actions" aria-label="作品窗口操作">
              <button
                className="modal-action"
                type="button"
                onClick={() => setViewerExpanded(value => !value)}
                aria-label={viewerExpanded ? '退出全屏' : '全屏查看作品窗口'}
              >
                {viewerExpanded ? '还原' : '全屏'}
              </button>
              <button className="modal-close" type="button" onClick={() => setActiveProject(null)} aria-label="关闭作品窗口">
                ×
              </button>
            </div>
            <header className="viewer-header">
              <p className="section-kicker">{activeProject.type}</p>
              <h2>{activeProject.title}</h2>
            </header>
            <div className="viewer-scroll" ref={viewerScrollRef}>
              {activeProject.intro && <p className="viewer-intro">{activeProject.intro}</p>}
              {activeProject.content.length > 0 ? (
                activeProject.content.map((item, index) => {
                  if (item.kind === 'composite') {
                    return (
                      <div className="work-composite" key={`${item.kind}-${index}`}>
                        <img className="work-composite-base" src={item.src} alt={item.alt} />
                        {item.overlays.map((overlay, overlayIndex) => (
                          <img
                            className="work-overlay-gif"
                            src={overlay.src}
                            alt={overlay.alt}
                            style={overlay.style}
                            key={`${overlay.src}-${overlayIndex}`}
                          />
                        ))}
                      </div>
                    )
                  }

                  if (item.kind === 'video') {
                    return (
                      <video
                        className="work-video"
                        src={item.src}
                        poster={item.poster}
                        controls
                        playsInline
                        preload="metadata"
                        key={`${item.kind}-${index}`}
                      />
                    )
                  }

                  if (item.kind === 'iframe') {
                    return (
                      <iframe
                        className="work-report-frame"
                        src={item.src}
                        title={item.title}
                        key={`${item.kind}-${index}`}
                      />
                    )
                  }

                  if (item.kind === 'link') {
                    return (
                      <a
                        className="work-resource-link"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        key={`${item.kind}-${index}`}
                      >
                        <span>{item.label}</span>
                        <small>{item.note}</small>
                      </a>
                    )
                  }

                  return (
                    <img
                      className="work-slide"
                      src={item.src}
                      alt={item.alt}
                      key={`${item.kind}-${index}`}
                    />
                  )
                })
              ) : (
                <div className="work-empty">
                  <p className="section-kicker">COMING SOON</p>
                  <h3>作品内容待补充</h3>
                  <p>这里会使用同样的上下滑动窗口展示后续作品。</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
