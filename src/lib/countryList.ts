import countryList from 'country-list';

const mappedCountryList = [
    {
        label: 'Malaysia',
        value: 'Malaysia',
    },
];

mappedCountryList.push(
    ...countryList.getNames().map((country) => {
        return {
            label: country,
            value: country,
        };
    })
);

export default mappedCountryList;
