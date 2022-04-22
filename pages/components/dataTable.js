import styles from '../../styles/DataTable.module.css'

const DataTable = ({ data }) => <div className={styles.dataTableWrapper}>
    <table className={styles.dataTable}>
        <thead>
            <tr>
                <th rowSpan="2">Name</th>
                <th rowSpan="2">Age</th>
                <th colSpan="3" align="center">Address</th>
            </tr>
            <tr>
                <th>Street</th>
                <th>ZipCode</th>
                <th>City</th>
            </tr>
        </thead>
        <tbody>
            {data && data.map((item, key) => <tr key={key}>
                <td>{item.Name}</td>
                <td>{item.Age}</td>
                <td>{item.Address.Street}</td>
                <td>{item.Address.ZipCode}</td>
                <td>{item.Address.City}</td>
            </tr>)}
        </tbody>
    </table>
</div>;

export default DataTable;