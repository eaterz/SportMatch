import React, { useState, useEffect } from 'react';
import { Users, Trophy, Calendar, MapPin, Star, ChevronRight, Search } from 'lucide-react';

export default function Welcome() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);

    const auth = { user: null };

    const redirectToLogin = () => {
        window.location.href = '/login';
    };

    const redirectToRegister = () => {
        window.location.href = '/register';
    };

    const redirectToProfile = () => {
        window.location.href = '/dashboard';
    };

    const sportImages = [
        {
            src: "https://prostatecanceruk.org/media/wbsnkf2h/football-friends-game-sport-adobestock_211603312.jpeg?anchor=center&mode=crop&width=1920&height=554&rnd=132611436416270000&format=webp&quality=80%201x,%20/media/wbsnkf2h/football-friends-game-sport-adobestock_211603312.jpeg?anchor=center&mode=crop&width=3840&height=1108&rnd=132611436416270000&format=webp&quality=80%202x",
            alt: "Futbola spēle",
            sport: "Futbols"
        },
        {
            src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop",
            alt: "Basketbola spēle",
            sport: "Basketbols"
        },
        {
            src: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop",
            alt: "Tenisa spēle",
            sport: "Teniss"
        },
        {
            src: "https://authentic.co/wp-content/uploads/authentic-ab-6302-preview.jpg",
            alt: "Volejbols",
            sport: "Volejbols"
        }
    ];

    const features = [
        {
            icon: Users,
            title: "Atrodi Sporta Partnerus",
            description: "Savieno ar cilvēkiem, kas dalās tavās sporta interesēs un vēlas trenēties kopā",
            image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
        },
        {
            icon: Trophy,
            title: "Pievieno Sporta Grupām",
            description: "Atklāj vietējos sporta klubus, komandas un regulārus treniņu grupas",
            image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop"
        },
        {
            icon: Calendar,
            title: "Organizē Spēles",
            description: "Izveido sporta pasākumus, turnīrus un ielūdz citus dalībniekus",
            image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop"
        },
        {
            icon: MapPin,
            title: "Vietējie Pasākumi",
            description: "Atrodi sporta aktivitātes un treniņus savā pilsētā vai rajonā",
            image: "https://www.riddlevillage.com/wp-content/uploads/sports-for-seniors.jpg"
        }
    ];

    const testimonials = [
        {
            name: "Mārtiņš K.",
            text: "Atklāju fantastisku basketbola komandu! Tagad spēlēju katru nedēļu un esmu ieguvis jaunus draugus.",
            sport: "Basketbols",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Laura S.",
            text: "Beidzot atradu skrējiena partneri! Motivācija ir divreiz lielāka, kad ir ar ko dalīties.",
            sport: "Skrējiens",
            rating: 5,
            image: "https://hips.hearstapps.com/hmg-prod/images/single-women-happier-than-men-675ac891b545d.jpg?crop=0.670xw:1.00xh;0.247xw,0&resize=640:*"
        },
        {
            name: "Andris P.",
            text: "Lieliski organizēti tenisa turnīri. Platforma palīdzēja atrast partneri manā līmenī.",
            sport: "Teniss",
            rating: 5,
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        }
    ];

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % sportImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            SportMatch
                        </h1>
                    </div>

                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <button
                                onClick={redirectToProfile}
                                className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-300"
                            >
                                Mans Profils
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={redirectToLogin}
                                    className="px-6 py-2 text-gray-700 hover:text-black border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-300"
                                >
                                    Pieslēgties
                                </button>
                                <button
                                    onClick={redirectToRegister}
                                    className="px-6 py-2 bg-black hover:bg-gray-800 text-white rounded-lg font-medium transition-all duration-300"
                                >
                                    Reģistrēties
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-8'}`}>
                        <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Atrodi Savu
                            <br />
                            <span className="text-blue-600">Sporta Partneri</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            Platforma, kas apvieno sporta entuziastus. Atrodi partnerus, pievienojies grupām un organizē sporta pasākumus savā pilsētā.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <button
                                onClick={redirectToRegister}
                                className="group px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2"
                            >
                                <Search className="w-5 h-5" />
                                <span>Sākt Meklēt</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={redirectToLogin}
                                className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg font-semibold text-lg transition-all duration-300"
                            >
                                Pieslēgties
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-1">1,250+</div>
                                <div className="text-sm text-gray-600">Aktīvi Lietotāji</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-1">450+</div>
                                <div className="text-sm text-gray-600">Sporta Grupas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-gray-900 mb-1">15+</div>
                                <div className="text-sm text-gray-600">Sporta Veidi</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Image Carousel */}
                    <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'}`}>
                        <div className="relative">
                            <div className="relative w-full h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                                {sportImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`absolute inset-0 transition-all duration-1000 ${
                                            index === currentImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                        }`}
                                    >
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                        <div className="absolute bottom-6 left-6 text-white">
                                            <h3 className="text-2xl font-bold">{image.sport}</h3>
                                            <p className="text-white/80">Atrodi partnerus šajā sportā</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Image indicators */}
                            <div className="flex justify-center space-x-2 mt-6">
                                {sportImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImage(index)}
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                            index === currentImage ? 'bg-black' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-gray-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Kāpēc Izvēlēties SportMatch?</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Mēs esam izveidojuši viegli lietojamu platformu, kas palīdz sporta entuziastiem atrast viens otru
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                                    <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
                                        <feature.icon className="w-6 h-6 text-gray-900" />
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Hero Image Section */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://cdn.shopify.com/s/files/1/0521/0996/7560/files/shutterstock_1779681110_1024x1024.jpg?v=1617987950"
                            alt="Sporta komanda"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-center">
                            <div className="max-w-3xl px-6">
                                <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                                    Iepazīsties Caur Sportu
                                </h2>
                                <p className="text-xl text-white/90 mb-8">
                                    Vairāk nekā 1000 sporta entuziasti jau ir atraduši savus ideālos partnerus un komandas
                                </p>
                                <button
                                    onClick={redirectToRegister}
                                    className="px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105"
                                >
                                    Pievienoties Tagad
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-gray-50 py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Ko Saka Mūsu Lietotāji</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 leading-relaxed italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.sport}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Sports Grid */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Populārākie Sporta Veidi</h2>
                    <p className="text-xl text-gray-600 text-center mb-16">Izvēlies savu iecienītāko sportu un sāc meklēt partnerus</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { name: "Futbols", image: "https://media.istockphoto.com/id/636267430/photo/teenage-friends-playing-football.jpg?s=612x612&w=0&k=20&c=_tgHfR2aD-Q2OXG0zchCunHNEvZDPT9UdxMkhNiWHTM=" },
                            { name: "Basketbols", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop" },
                            { name: "Teniss", image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=300&h=200&fit=crop" },
                            { name: "Volejbols", image: "https://authentic.co/wp-content/uploads/authentic-ab-6302-preview.jpg" },
                            { name: "Skrējiens", image: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=300&h=200&fit=crop" },
                            { name: "Peldēšana", image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=300&h=200&fit=crop" }
                        ].map((sport, index) => (
                            <div
                                key={index}
                                className="group cursor-pointer transition-all duration-300 transform hover:scale-105"
                                onClick={redirectToRegister}
                            >
                                <div className="relative h-32 rounded-xl overflow-hidden shadow-lg">
                                    <img
                                        src={sport.image}
                                        alt={sport.name}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white font-semibold text-lg">{sport.name}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&h=600&fit=crop"
                        alt="Sporta komanda"
                        className="w-full h-full object-cover opacity-20"
                    />
                </div>
                <div className="relative z-10 max-w-4xl mx-auto text-center px-6 lg:px-8">
                    <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                        Gatavs Sākt Savu Sporta Ceļojumu?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Pievienojies tūkstošiem sporta entuziasti, kas jau ir atraduši savus ideālos sporta partnerus un komandas.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={redirectToRegister}
                            className="px-10 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                            <Users className="w-6 h-6" />
                            <span>Reģistrēties Bezmaksas</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-2">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">SportMatch</span>
                            </div>
                            <p className="text-gray-600 mb-4 max-w-md">
                                Apvieno sporta entuziastus visā Latvijā. Atrodi partnerus, pievienojies grupām un izbaudi sportu kopā ar citiem.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Platforma</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Kā Darbojas</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Sporta Veidi</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Cenas</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Uzņēmums</h4>
                            <ul className="space-y-2 text-gray-600">
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Par Mums</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Kontakti</a></li>
                                <li><a href="#" className="hover:text-gray-900 transition-colors">Karjera</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 text-sm">
                            © 2025 SportMatch. Visas tiesības aizsargātas.
                        </p>
                        <div className="flex space-x-6 text-sm text-gray-600 mt-4 md:mt-0">
                            <a href="#" className="hover:text-gray-900 transition-colors">Privātuma Politika</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Noteikumi</a>
                            <a href="#" className="hover:text-gray-900 transition-colors">Sīkdatnes</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
