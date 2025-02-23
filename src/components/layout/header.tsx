export const TopHeader = () => {
    return (
        <div className="sticky top-0 z-50 w-full h-[80px] absolute">
            <div className="w-full h-full bg-[#FBF7DD] flex flex-col sticky top-0 z-1000">
                <div className="w-full h-full px-10 flex items-center">
                    <img src="../../../public/fluffyduck_header.png" alt="Header Image" className="h-16" />
                </div>
            </div>
        </div>
    );
}