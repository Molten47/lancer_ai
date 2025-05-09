import React from 'react'
import Image1 from '../../assets/Images/Frame 10.png'
import Image2 from '../../assets/Images/Frame 11.png'
import Image3 from '../../assets/Images/Frame 12.png'
import Image4 from '../../assets/Images/Frame 14.png'
import Image7 from '../../assets/Images/Ellipse 1.png'
import DottedImage from'../../assets/Images/Group 2.png'
import AiImage from'../../assets/Images/Brainwire.png'
const Philosophy = () => {
  return (
    <div className='w-full h-[85vh] bg-white flex flex-row pt-20 pb-26 px-5'>
      <div className='relative w-[40%] flex justify-center items-center'> {/* Added justify-center and items-center */}
  <img src={DottedImage} alt="" className='absolute  w-[40%] h-[30vh] z-0 -top-12 left-20' />
  <img src={AiImage} alt="" className='relative z-5 w-[70%] h-auto' /> {/* Made AiImage relative and adjusted size */}
</div>
        <div className='flex flex-col w-[60%]'>
  <div className='flex flex-col gap-6 mb-4'>
    <h2 className='text-primary basic-font font-semibold text-[42px] uppercase mb-6'>Who we are</h2>
    <p className='text-primary basic-font font-normal text-[20px] w-[75%]'>
      Lancer is a next-generation freelancing platform powered by AI built to revolutionize how businesses connect with
      top-tier freelance talent.
      <br /> <br />
      Whether you're a startup founder, agency, or enterprise team, Lancer eliminates the friction in hiring by using
      intelligent automation to match you with the right professionals — in seconds.
    </p>
  </div>

  <div className='min-h-[35vh] flex flex-col justify-center items-start mt-6'> {/* items-start for left alignment */}
    <div className='flex flex-row justify-between items-center mb-10 gap-6 w-[75%]'> {/* Same width as text */}
      <div className='relative'>
        <img src={Image1} alt="" className="relative z-10" />
        <img
          src={Image7}
          alt="Online"
          className="absolute top-1 right-2 w-5 h-5 rounded-full border-2 border-white z-20"
        />
      </div>
      <div className='flex justify-center'>
      <p className='w-[36rem] text-[20px] font-medium  basic-font text-center'> {/* text-left for alignment */}
        Enjoy skill matching, timezone synchronization, AI screening, and automated fair pricing <br /><span className='text-cta'>— all in one smart freelancing platform.</span>
      </p>
      </div>
 
      <div className=''></div> {/* Empty div */}
      <div className='relative'>
        <img src={Image2} alt="" className="relative z-10" />
        <img
          src={Image7}
          alt="Online"
          className="absolute top-1 right-2 w-5 h-5 rounded-full border-2 border-white z-20"
        />
      </div>
    </div>
    <div className='flex flex-row justify-center items-center pl-12 p-8 w-[60%]'> {/* Same width as text */}
      <div className='relative'>
        <img src={Image3} alt="Person" className="relative z-10 w-24 h-24 rounded-full" />
        <div
          className='absolute bottom-10 left-14 px-9 py-2 basic-font rounded-tr-lg bg-[#DBEAFE] z-0'
          style={{ minWidth: '150px' }}
        >
          <span className="text-sm text-nowrap">I want to hire a designer</span>
        </div>
      </div>

      <div className='relative ml-auto'> {/* ml-auto to push to the right */}
        <img src={Image4} alt="Person" className="relative z-10 w-24 h-24 rounded-full" />
        <div
          className='absolute bottom-10 basic-font left-14 px-9 py-2 text-nowrap rounded-tr-lg bg-[#DBEAFE] z-0'
          style={{ minWidth: '120px' }}
        >
          <span className="text-sm">I need a writer</span>
        </div>
      </div>
    </div>
  </div>
</div>

      
    </div>
  )
}

export default Philosophy
