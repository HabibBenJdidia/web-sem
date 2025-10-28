import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./landing.css";

export function LandingPage() {
  const [openNav, setOpenNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className={`navbar navbar-expand-lg navbar-light fixed-top d-block ${scrolled ? 'navbar-scrolled' : ''}`} data-navbar-on-scroll="data-navbar-on-scroll">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/assets/img/logo.svg" height="34" alt="logo" />
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            onClick={() => setOpenNav(!openNav)}
            aria-expanded={openNav}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="navbar-collapse">
            <ul className="navbar-nav ms-auto pt-2 pt-lg-0 font-base align-items-lg-center align-items-start">
              <li className="nav-item px-3 px-xl-4">
                <a className="nav-link fw-medium" href="#service">Service</a>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <a className="nav-link fw-medium" href="#destination">Destination</a>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <a className="nav-link fw-medium" href="#booking">Booking</a>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <Link className="nav-link fw-medium" to="/transport">Transport</Link>
              </li>
              <li className="nav-item px-3 px-xl-4">
                <a className="nav-link fw-medium" href="#testimonial">Testimonial</a>
              </li>
              
              {!user ? (
                <>
                  <li className="nav-item px-3 px-xl-4">
                    <Link className="nav-link fw-medium" to="/auth/sign-in">Login</Link>
                  </li>
                  <li className="nav-item px-3 px-xl-4">
                    <Link className="btn btn-outline-dark order-1 order-lg-0 fw-medium" to="/auth/sign-up">
                      Sign Up
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item px-3 px-xl-4 user-menu-container">
                  <button 
                    className="user-menu-trigger"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="user-name">{user.nom}</span>
                    <svg className={`chevron ${showUserMenu ? 'open' : ''}`} width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-dropdown-name">{user.nom}</div>
                        <div className="user-dropdown-email">{user.email}</div>
                      </div>
                      <div className="user-dropdown-divider"></div>
                      <Link 
                        to="/profile" 
                        className="user-dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        className="user-dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Settings
                      </Link>
                      <Link 
                        to="/change-password" 
                        className="user-dropdown-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Change Password
                      </Link>
                      <div className="user-dropdown-divider"></div>
                      <button 
                        onClick={handleLogout}
                        className="user-dropdown-item logout"
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 6 15 7.414z" clipRule="evenodd" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main" id="top">
        {/* Hero Section */}
        <section style={{ paddingTop: '7rem' }}>
          <div className="bg-holder" style={{ backgroundImage: 'url(/assets/img/hero/hero-bg.svg)' }}></div>
          
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-5 col-lg-6 order-0 order-md-1 text-end">
                <img className="pt-7 pt-md-0 hero-img" src="/assets/img/hero/hero-img.png" alt="hero-header" />
              </div>
              <div className="col-md-7 col-lg-6 text-md-start text-center py-6">
                <h4 className="fw-bold text-danger mb-3">Best Destinations around the world</h4>
                <h1 className="hero-title">Travel, enjoy and live a new and full life</h1>
                <p className="mb-4 fw-medium">
                  Built Wicket longer admire do barton vanity itself do in it.<br className="d-none d-xl-block" />
                  Preferred to sportsmen it engrossed listening. Park gate<br className="d-none d-xl-block" />
                  sell they west hard for the.
                </p>
                <div className="text-center text-md-start">
                  <Link className="btn btn-primary btn-lg me-md-4 mb-3 mb-md-0 border-0 primary-btn-shadow" to="/auth/sign-up">
                    Find out more
                  </Link>
                  <div className="w-100 d-block d-md-none"></div>
                  <a href="#!" role="button" data-bs-toggle="modal" data-bs-target="#popupVideo">
                    <span className="btn btn-danger round-btn-lg rounded-circle me-3 danger-btn-shadow">
                      <img src="/assets/img/hero/play.svg" width="15" alt="play" />
                    </span>
                  </a>
                  <span className="fw-medium">Play Demo</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="pt-5 pt-md-9" id="service">
          <div className="container">
            <div className="position-absolute z-index--1 end-0 d-none d-lg-block">
              <img src="/assets/img/category/shape.svg" style={{ maxWidth: '200px' }} alt="service" />
            </div>
            <div className="mb-7 text-center">
              <h5 className="text-secondary">CATEGORY</h5>
              <h3 className="fs-xl-10 fs-lg-8 fs-7 fw-bold font-cursive text-capitalize">We Offer Best Services</h3>
            </div>
            <div className="row">
              <div className="col-lg-3 col-sm-6 mb-6">
                <div className="card service-card shadow-hover rounded-3 text-center align-items-center">
                  <div className="card-body p-xxl-5 p-4">
                    <img src="/assets/img/category/icon1.png" width="75" alt="Service" />
                    <h4 className="mb-3">Calculated Weather</h4>
                    <p className="mb-0 fw-medium">Built Wicket longer admire do barton vanity itself do in it.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 mb-6">
                <div className="card service-card shadow-hover rounded-3 text-center align-items-center">
                  <div className="card-body p-xxl-5 p-4">
                    <img src="/assets/img/category/icon2.png" width="75" alt="Service" />
                    <h4 className="mb-3">Best Flights</h4>
                    <p className="mb-0 fw-medium">Engrossed listening. Park gate sell they west hard for the.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 mb-6">
                <div className="card service-card shadow-hover rounded-3 text-center align-items-center">
                  <div className="card-body p-xxl-5 p-4">
                    <img src="/assets/img/category/icon3.png" width="75" alt="Service" />
                    <h4 className="mb-3">Local Events</h4>
                    <p className="mb-0 fw-medium">Barton vanity itself do in it. Preferred to men it engrossed listening.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6 mb-6">
                <div className="card service-card shadow-hover rounded-3 text-center align-items-center">
                  <div className="card-body p-xxl-5 p-4">
                    <img src="/assets/img/category/icon4.png" width="75" alt="Service" />
                    <h4 className="mb-3">Customization</h4>
                    <p className="mb-0 fw-medium">We deliver outsourced aviation services for military customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Destinations Section */}
        <section className="pt-5" id="destination">
          <div className="container">
            <div className="position-absolute start-100 bottom-0 translate-middle-x d-none d-xl-block ms-xl-n4">
              <img src="/assets/img/dest/shape.svg" alt="destination" />
            </div>
            <div className="mb-7 text-center">
              <h5 className="text-secondary">Top Selling</h5>
              <h3 className="fs-xl-10 fs-lg-8 fs-7 fw-bold font-cursive text-capitalize">Top Destinations</h3>
            </div>
            <div className="row">
              <div className="col-md-4 mb-4">
                <div className="card overflow-hidden shadow">
                  <img className="card-img-top" src="/assets/img/dest/dest1.jpg" alt="Rome, Italy" />
                  <div className="card-body py-4 px-3">
                    <div className="d-flex flex-column flex-lg-row justify-content-between mb-3">
                      <h4 className="text-secondary fw-medium">
                        <a className="link-900 text-decoration-none stretched-link" href="#!">Rome, Italy</a>
                      </h4>
                      <span className="fs-1 fw-medium">$5,42k</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <img src="/assets/img/dest/navigation.svg" style={{ marginRight: '14px' }} width="20" alt="navigation" />
                      <span className="fs-0 fw-medium">10 Days Trip</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card overflow-hidden shadow">
                  <img className="card-img-top" src="/assets/img/dest/dest2.jpg" alt="London, UK" />
                  <div className="card-body py-4 px-3">
                    <div className="d-flex flex-column flex-lg-row justify-content-between mb-3">
                      <h4 className="text-secondary fw-medium">
                        <a className="link-900 text-decoration-none stretched-link" href="#!">London, UK</a>
                      </h4>
                      <span className="fs-1 fw-medium">$4.2k</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <img src="/assets/img/dest/navigation.svg" style={{ marginRight: '14px' }} width="20" alt="navigation" />
                      <span className="fs-0 fw-medium">12 Days Trip</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-4">
                <div className="card overflow-hidden shadow">
                  <img className="card-img-top" src="/assets/img/dest/dest3.jpg" alt="Full Europe" />
                  <div className="card-body py-4 px-3">
                    <div className="d-flex flex-column flex-lg-row justify-content-between mb-3">
                      <h4 className="text-secondary fw-medium">
                        <a className="link-900 text-decoration-none stretched-link" href="#!">Full Europe</a>
                      </h4>
                      <span className="fs-1 fw-medium">$15k</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <img src="/assets/img/dest/navigation.svg" style={{ marginRight: '14px' }} width="20" alt="navigation" />
                      <span className="fs-0 fw-medium">28 Days Trip</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="booking">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="mb-4 text-start">
                  <h5 className="text-secondary">Easy and Fast</h5>
                  <h3 className="fs-xl-10 fs-lg-8 fs-7 fw-bold font-cursive text-capitalize">Book your next trip in 3 easy steps</h3>
                </div>
                <div className="d-flex align-items-start mb-5">
                  <div className="bg-primary me-sm-4 me-3 p-3" style={{ borderRadius: '13px' }}>
                    <img src="/assets/img/steps/selection.svg" width="22" alt="steps" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-secondary fw-bold fs-0">Choose Destination</h5>
                    <p>Choose your favourite place. No matter <br className="d-none d-sm-block" /> where you travel inside the World.</p>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-5">
                  <div className="bg-danger me-sm-4 me-3 p-3" style={{ borderRadius: '13px' }}>
                    <img src="/assets/img/steps/water-sport.svg" width="22" alt="steps" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-secondary fw-bold fs-0">Make Payment</h5>
                    <p>After find your perfect spot, make your <br className="d-none d-sm-block" /> payment and get ready to travel.</p>
                  </div>
                </div>
                <div className="d-flex align-items-start mb-5">
                  <div className="bg-info me-sm-4 me-3 p-3" style={{ borderRadius: '13px' }}>
                    <img src="/assets/img/steps/taxi.svg" width="22" alt="steps" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-secondary fw-bold fs-0">Reach Airport on Selected Date</h5>
                    <p>Lastly, you have to arrive at the airport <br className="d-none d-sm-block" /> on time and enjoy the vacation.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 d-flex justify-content-center align-items-start">
                <div className="card position-relative shadow" style={{ maxWidth: '370px' }}>
                  <div className="position-absolute z-index--1 me-10 me-xxl-0" style={{ right: '-160px', top: '-210px' }}>
                    <img src="/assets/img/steps/bg.png" style={{ maxWidth: '550px' }} alt="shape" />
                  </div>
                  <div className="card-body p-3">
                    <img className="mb-4 mt-2 rounded-2 w-100" src="/assets/img/steps/booking-img.jpg" alt="booking" />
                    <div>
                      <h5 className="fw-medium">Trip To Greece</h5>
                      <p className="fs--1 mb-3 fw-medium">14-29 June | by Robbin joseph</p>
                      <div className="icon-group mb-4">
                        <span className="btn icon-item">
                          <img src="/assets/img/steps/leaf.svg" alt="" />
                        </span>
                        <span className="btn icon-item">
                          <img src="/assets/img/steps/map.svg" alt="" />
                        </span>
                        <span className="btn icon-item">
                          <img src="/assets/img/steps/send.svg" alt="" />
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center mt-n1">
                          <img className="me-3" src="/assets/img/steps/building.svg" width="18" alt="building" />
                          <span className="fs--1 fw-medium">24 people going</span>
                        </div>
                        <div className="show-onhover position-relative">
                          <button className="btn btn-primary">
                            <img src="/assets/img/steps/heart.svg" width="20" alt="step" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonial">
          <div className="container">
            <div className="row">
              <div className="col-lg-5">
                <div className="mb-8 text-start">
                  <h5 className="text-secondary">TESTIMONIALS</h5>
                  <h3 className="fs-xl-10 fs-lg-8 fs-7 fw-bold font-cursive text-capitalize">What people say about Us.</h3>
                </div>
              </div>
              <div className="col-lg-1"></div>
              <div className="col-lg-6">
                <div className="pe-7 ps-5 ps-lg-0">
                  <div className="carousel slide carousel-fade position-relative" id="testimonialIndicator" data-bs-ride="carousel">
                    <div className="carousel-inner">
                      <div className="carousel-item active" data-bs-interval="10000">
                        <div className="row h-100">
                          <div className="col-12">
                            <div className="card shadow" style={{ borderRadius: '10px' }}>
                              <div className="card-body p-5">
                                <p className="fs--1 mb-4 fw-medium">
                                  "On the Windows talking painted pasture yet its express parties use. 
                                  Sure last upon he same as knew next. Of believed or diverted no."
                                </p>
                                <div className="d-flex align-items-center gap-3">
                                  <img className="img-fluid" src="/assets/img/testimonial/author.png" width="70" alt="testimonials" />
                                  <div>
                                    <h6 className="text-secondary">Mike taylor</h6>
                                    <p className="fs--1 mb-0 fw-medium">Lahore, Pakistan</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="carousel-item" data-bs-interval="2000">
                        <div className="row h-100">
                          <div className="col-12">
                            <div className="card shadow" style={{ borderRadius: '10px' }}>
                              <div className="card-body p-5">
                                <p className="fs--1 mb-4 fw-medium">
                                  "On the Windows talking painted pasture yet its express parties use. 
                                  Sure last upon he same as knew next. Of believed or diverted no."
                                </p>
                                <div className="d-flex align-items-center gap-3">
                                  <img className="img-fluid" src="/assets/img/testimonial/author2.png" width="70" alt="testimonials" />
                                  <div>
                                    <h6 className="text-secondary">Thomas wagon</h6>
                                    <p className="fs--1 mb-0 fw-medium">CEO of Red Button</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="carousel-item">
                        <div className="row h-100">
                          <div className="col-12">
                            <div className="card shadow" style={{ borderRadius: '10px' }}>
                              <div className="card-body p-5">
                                <p className="fs--1 mb-4 fw-medium">
                                  "On the Windows talking painted pasture yet its express parties use. 
                                  Sure last upon he same as knew next. Of believed or diverted no."
                                </p>
                                <div className="d-flex align-items-center gap-3">
                                  <img className="img-fluid" src="/assets/img/testimonial/author3.png" width="70" alt="testimonials" />
                                  <div>
                                    <h6 className="text-secondary">Ama Ampomah</h6>
                                    <p className="fs--1 mb-0 fw-medium">CEO of Mtn</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row mt-4 flex-center">
                      <div className="col-auto position-relative z-index-2">
                        <ol className="carousel-indicators me-xxl-7 me-xl-4 me-lg-7">
                          <li className="active" data-bs-target="#testimonialIndicator" data-bs-slide-to="0"></li>
                          <li data-bs-target="#testimonialIndicator" data-bs-slide-to="1"></li>
                          <li data-bs-target="#testimonialIndicator" data-bs-slide-to="2"></li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="pt-5 pt-md-9">
          <div className="container">
            <div className="row flex-center">
              <div className="col-md-auto mb-4">
                <img className="img-fluid pe-3" src="/assets/img/partner/1.png" width="150" alt="partner" />
              </div>
              <div className="col-md-auto mb-4">
                <img className="img-fluid pe-3" src="/assets/img/partner/2.png" width="150" alt="partner" />
              </div>
              <div className="col-md-auto mb-4">
                <img className="img-fluid pe-3" src="/assets/img/partner/3.png" width="150" alt="partner" />
              </div>
              <div className="col-md-auto mb-4">
                <img className="img-fluid pe-3" src="/assets/img/partner/4.png" width="150" alt="partner" />
              </div>
              <div className="col-md-auto mb-4">
                <img className="img-fluid pe-3" src="/assets/img/partner/5.png" width="150" alt="partner" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pt-7">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-5 order-md-0 text-center text-md-start">
                <img className="img-fluid mb-4" src="/assets/img/cta/send.png" width="280" alt="cta" />
              </div>
              <div className="col-md-7 text-center text-md-start">
                <h2 className="mb-4 fs-6">Subscribe to get information, latest news and other interesting offers about Jadoo</h2>
                <div className="row">
                  <div className="col-sm-8 mb-4 mb-sm-0">
                    <input className="form-control" type="email" placeholder="Your email" />
                  </div>
                  <div className="col-sm-4">
                    <button className="btn btn-danger">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="pt-7 pb-0">
          <div className="container">
            <div className="row">
              <div className="col-lg-3 col-md-7 col-12 mb-4 mb-md-6 mb-lg-0 order-0">
                <img className="mb-4" src="/assets/img/logo2.svg" width="150" alt="jadoo" />
                <p className="fs--1 text-secondary mb-0 fw-medium">Book your trip in minute, get full Control for much longer.</p>
              </div>
              <div className="col-lg-2 col-md-4 mb-4 mb-lg-0 order-lg-1 order-md-2">
                <h4 className="footer-heading-color fw-bold font-sans-serif mb-3 mb-lg-4">Company</h4>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">About</a></li>
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Careers</a></li>
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Mobile</a></li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-4 mb-4 mb-lg-0 order-lg-2 order-md-3">
                <h4 className="footer-heading-color fw-bold font-sans-serif mb-3 mb-lg-4">Contact</h4>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Help/FAQ</a></li>
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Press</a></li>
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Affiliates</a></li>
                </ul>
              </div>
              <div className="col-lg-2 col-md-4 mb-4 mb-lg-0 order-lg-3 order-md-4">
                <h4 className="footer-heading-color fw-bold font-sans-serif mb-3 mb-lg-4">More</h4>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Airlinefees</a></li>
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Airline</a></li>
                  <li className="mb-2"><a className="link-900 fs-1 fw-medium text-decoration-none" href="#!">Low fare tips</a></li>
                </ul>
              </div>
              <div className="col-lg-3 col-md-5 col-12 mb-4 mb-md-6 mb-lg-0 order-lg-4 order-md-1">
                <div className="icon-group mb-4">
                  <a className="text-decoration-none icon-item shadow-social" href="#!">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a className="text-decoration-none icon-item shadow-social" href="#!">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a className="text-decoration-none icon-item shadow-social" href="#!">
                    <i className="fab fa-twitter"></i>
                  </a>
                </div>
                <h4 className="fw-medium font-sans-serif text-secondary mb-3">Discover our app</h4>
                <div className="d-flex align-items-center">
                  <a href="#!">
                    <img className="me-2" src="/assets/img/play-store.png" width="135" alt="play store" />
                  </a>
                  <a href="#!">
                    <img src="/assets/img/apple-store.png" width="135" alt="apple store" />
                  </a>
                </div>
              </div>
            </div>
            <hr className="text-300" />
            <div className="row justify-content-md-between justify-content-evenly py-3">
              <div className="col-12 col-sm-8 col-md-6 col-lg-auto text-center text-md-start">
                <p className="fs--1 my-2 fw-medium text-200">All rights Reserved © Travel-Tourism 2025</p>
              </div>
              <div className="col-12 col-sm-8 col-md-6">
                <p className="fs--1 my-2 text-center text-md-end text-200">
                  Made with ❤️ by <a className="fw-bold text-decoration-none text-secondary" href="https://themewagon.com/" target="_blank" rel="noopener noreferrer">ThemeWagon</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
