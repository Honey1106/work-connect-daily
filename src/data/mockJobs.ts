export interface Job {
  id: string;
  type: string;
  typeIcon: string;
  wage: number;
  startTime: string;
  endTime: string;
  location: string;
  employerPhone: string;
  postedAt: Date;
}

export const jobTypes = [
  { id: 'construction', label: 'Construction', icon: 'hard-hat' },
  { id: 'farming', label: 'Farming', icon: 'wheat' },
  { id: 'delivery', label: 'Delivery', icon: 'truck' },
  { id: 'helper', label: 'Helper', icon: 'hand-helping' },
  { id: 'cleaning', label: 'Cleaning', icon: 'sparkles' },
  { id: 'cooking', label: 'Cooking', icon: 'chef-hat' },
  { id: 'painting', label: 'Painting', icon: 'paint-roller' },
  { id: 'loading', label: 'Loading/Unloading', icon: 'package' },
];

export const mockJobs: Job[] = [
  {
    id: '1',
    type: 'Construction',
    typeIcon: 'hard-hat',
    wage: 600,
    startTime: '07:00',
    endTime: '17:00',
    location: 'Gachibowli, Hyderabad',
    employerPhone: '+919876543210',
    postedAt: new Date(),
  },
  {
    id: '2',
    type: 'Farming',
    typeIcon: 'wheat',
    wage: 450,
    startTime: '06:00',
    endTime: '14:00',
    location: 'Shamshabad Village',
    employerPhone: '+919876543211',
    postedAt: new Date(),
  },
  {
    id: '3',
    type: 'Delivery',
    typeIcon: 'truck',
    wage: 500,
    startTime: '09:00',
    endTime: '18:00',
    location: 'Kukatpally, Hyderabad',
    employerPhone: '+919876543212',
    postedAt: new Date(),
  },
  {
    id: '4',
    type: 'Helper',
    typeIcon: 'hand-helping',
    wage: 400,
    startTime: '08:00',
    endTime: '16:00',
    location: 'Kondapur, Hyderabad',
    employerPhone: '+919876543213',
    postedAt: new Date(),
  },
  {
    id: '5',
    type: 'Cleaning',
    typeIcon: 'sparkles',
    wage: 350,
    startTime: '07:00',
    endTime: '12:00',
    location: 'Jubilee Hills, Hyderabad',
    employerPhone: '+919876543214',
    postedAt: new Date(),
  },
  {
    id: '6',
    type: 'Loading/Unloading',
    typeIcon: 'package',
    wage: 550,
    startTime: '05:00',
    endTime: '11:00',
    location: 'Bowenpally Market',
    employerPhone: '+919876543215',
    postedAt: new Date(),
  },
];
