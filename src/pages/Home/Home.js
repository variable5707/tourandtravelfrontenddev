import { Fragment,useEffect,useState } from "react";
import { getHotelsByPrice,getHotelsByRoomsAndBeds,
    getHotelsByPropertyType,
    getHotelsByRatings,
    getHotelsByCancelation, } from "../../utils";
import {Navbar,HotelCard,Categories,SearchStayWithDate,Filter,AuthModal} from "../../components";
import "./Home.css"
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import {useCategory,useDate,useFilter,useAuth} from "../../context";
export const Home = () => {
    const [hotels,setHotels]=useState([]);
    const [testData,setTestData]=useState([])
    const [hasMore,setHasMore]=useState(true);
    const [currentIndex,setCurrenntIndex]=useState(16);
    const {hotelCategory} =useCategory();
    const {isSearchModalOpen}=useDate();
    const {isFilterModalOpen,priceRange,noOfBathrooms,
        noOfBedrooms,
        noOfBeds,
        propertyType,
        traveloRating,
        isCancelable}=useFilter()
    const { isAuthModalOpen, isDropDownModalOpen } = useAuth();

    useEffect(()=>{
       (async()=>{
        try{
            const {data} =await axios.get(
                `https://tourandtravel.cyclic.app/api/hotels?category=${hotelCategory}`);
            setTestData(data);
            setHotels(data ? data.slice(0,16):[]);
            
        }
        catch(err)
        {
            console.log(err);
        }
       })() 
    },[hotelCategory]);
    const fetchMoreData=()=>{
    if(hotels.length>=testData.length){
        setHasMore(false)
        return
    }setTimeout(()=>{
        if(hotels && hotels.length>0){
            setHotels(hotels.concat(testData.slice(currentIndex,currentIndex+16)))
            setCurrenntIndex(prev=>prev+16)
        }else{
            setHotels([])
        }
    },1000)
    };

  const filteredHotelsByPrice = getHotelsByPrice(hotels, priceRange);
  const filteredHotelsByBedsAndRooms = getHotelsByRoomsAndBeds(
    filteredHotelsByPrice,
    noOfBathrooms,
    noOfBedrooms,
    noOfBeds
  );
  const filteredHotelsByPropertyType = getHotelsByPropertyType(
    filteredHotelsByBedsAndRooms,
    propertyType
  );

  const filteredHotelsByRatings = getHotelsByRatings(
    filteredHotelsByPropertyType,
    traveloRating
  );

  const filteredHotelsByCancelation = getHotelsByCancelation(
    filteredHotelsByRatings,
    isCancelable
  );


    
    return(
        <div className="relative">
            <Navbar/>
            <Categories/>
            
                {
                    hotels &&hotels.length>0 ?(
                        <InfiniteScroll
                            dataLength={hotels.length}
                            next={fetchMoreData}
                            hasMore={hasMore}
                            loader={hotels.length >0&& <h3 className="alert-text">Loading....</h3>}
                            endMessage={<p className="alert-text">You have seen it all!</p>}
                        >
                            <main className="main d-flex align-center wrap gap-larger">
                                {filteredHotelsByCancelation&& filteredHotelsByCancelation.map((hotel)=>(<HotelCard key={hotel._id} hotel={hotel}/>))}
                            </main>
                        </InfiniteScroll>
                    ):(<></>)
                }
                {isSearchModalOpen &&<SearchStayWithDate/>}
                {isFilterModalOpen&&<Filter/>}
                {isAuthModalOpen && <AuthModal />}
                
           
            
        </div>
        


    );
}