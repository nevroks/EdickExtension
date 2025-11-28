import { Button, TextInput } from "@/ui";
import { CHROME_STORAGE_KEYS } from "@/utils/consts/appConsts";
import { useChromeStorage } from "@/utils/hooks/useChromeStorage";
import useTInstrumentsApi from "@/utils/hooks/useTInstrumentsApi";


const MainScreen = () => {



    const { queries: { getBonds } } = useTInstrumentsApi()
    const [tinkoffToken, setTinkoffToken] = useChromeStorage(CHROME_STORAGE_KEYS["T-key"], "")

    const { data, error, refetch } = getBonds('INSTRUMENT_STATUS_UNSPECIFIED', 'INSTRUMENT_EXCHANGE_UNSPECIFIED')

    const handleClick = () => {

        refetch()
    }

    console.log(data);


    return (
        <div>
            <h1>Main</h1>
            <div>
                <p>{error && error.message}</p>
                <TextInput onChange={(e) => setTinkoffToken(e.target.value)} value={tinkoffToken} placeholder="Введите свой t-id" />
                <Button onClick={handleClick}>
                    <Button.Text text="Войти" />
                </Button>
            </div>

        </div>
    );
}

export default MainScreen;
