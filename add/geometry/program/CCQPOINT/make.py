f=open("output.txt","w")
f.write("891\n")
for i in range(-11,22) :
    for j in range(-5,22) :
        f.write("%d %d\n" % (i,j))
'''
f.write("1\n")
f.write("200000\n")
for i in range(100000) :
    f.write("1 %d\n" % i)
for i in range(100000) :
    f.write("2 %d\n" % (99999-i))
'''
